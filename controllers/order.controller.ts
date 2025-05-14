// import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cart.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";
import { trackUserActivity } from "../services/userActivity.service.js";

import { Response, Request } from "express";
import { OrderPayload } from '../type.js';
import sendEmail from "../services/sendEmail.service.js";

export async function CashOnDeliveryOrderController(request:Request,response:Response){
    try {
        const userId = request.userId // auth middleware 
        const { addressId } = request.body 
        
        // 1. Verify items in cart
        const cartItems = await CartProductModel.find({
                    userId : userId
                }).populate('productId')
        if(!cartItems.length){
            return response.status(400).json({
                message : "No item in the cart",
                error : true,
                success : false
            })
        }

        // 2. Check if user has addresses
        const user = await UserModel.findById(userId).populate('address_details')
        if(!user || !user.address_details || user.address_details.length === 0){
            return response.status(400).json({
                message : "No address found",
                error : true,
                success : false
            })
        }

        // 3. Validate selected address exists
        if(!addressId) {
            return response.status(400).json({
                message : "Delivery address is required",
                error : true,
                success : false
            })
        }
        
        // Check if addressId exists in user's addresses
        const selectedAddress = user.address_details.find((address) => address._id.toString() === addressId)
        if(!selectedAddress) {
            return response.status(400).json({
                message : "Invalid delivery address",
                error : true,
                success : false
            })
        }

        // 4. Calculate totals
        // Use type assertion for populated documents
        type CartItemWithProduct = {
            productId: {
                _id: string;
                title: string;
                price: number;
                discount: number;
                images: string[];
            };
            quantity: number;
        };

        const subTotalAmount = cartItems.reduce((acc, item) => {
            const typedItem = item.toObject() as unknown as CartItemWithProduct;
            return acc + (typedItem.productId.price * typedItem.quantity);
        }, 0);
        
        const totalAmount = cartItems.reduce((acc, item) => {
            const typedItem = item.toObject() as unknown as CartItemWithProduct;
            const discountAmount = Math.ceil((typedItem.productId.price * typedItem.productId.discount) / 100);
            const actualPrice = typedItem.productId.price - discountAmount;
            return acc + (actualPrice * typedItem.quantity);
        }, 0);

        // 5. Create a new order
        const typedCartItems = cartItems.map(item => item.toObject()) as unknown as CartItemWithProduct[];
        
        const order = new OrderModel({
            userId: userId,
            orderId: `ORD-${new mongoose.Types.ObjectId()}`,
            products: typedCartItems.map(item => item.productId._id),
            product_details: {
                name: typedCartItems[0].productId.title,
                image: typedCartItems.map(item => item.productId.images[0])
            },
            paymentId: "",
            paymentStatus: "pending",
            shippingAddress: [addressId],
            subTotalAmount,
            totalAmount,
            orderStatus: "pending"
        });
        
        const savedOrder = await order.save()
        
        // 6. Clear the cart
        await CartProductModel.deleteMany({ userId: userId })
        await UserModel.findByIdAndUpdate(userId, {
            shopping_cart: [],
            $push: { orderHistory: savedOrder._id }
        })

        // Track the purchase activity
        for (const item of typedCartItems) {
            await trackUserActivity(request, 'purchase', {
                productId: item.productId._id,
                quantity: item.quantity,
                orderId: savedOrder.orderId,
                amount: item.productId.price * item.quantity,
                paymentMethod: 'cash_on_delivery'
            });
        }

        // Also track the checkout event
        await trackUserActivity(request, 'checkout', {
            orderId: savedOrder.orderId,
            addressId: addressId,
            totalAmount: totalAmount,
            productCount: typedCartItems.length
        });

        // send order confirmation email
        try {
            await sendEmail({
               name: user.name,
                subject: "Order Confirmation",
               sendTo: 'haque22205101946@diu.edu.bd',
                html: `
                p>Dear ${user.name},</p>
                          <p>Thank you for your order!</p>
                          <p>We are pleased to confirm that your order has been successfully placed.</p>
                            <p>Order Details:</p>
                            <ul>
                                <li>Order ID: ${savedOrder.orderId}</li>
                                <li>Shipping Address: ${selectedAddress}</li>
                                <li>Product Name: ${typedCartItems[0].productId.title}</li>
                                <li>Quantity: ${typedCartItems[0].quantity}</li>
                                <li>Total Amount: ${totalAmount}</li>
                            </ul>
                            <p>We will notify you once your order is shipped.</p>
                <p>Your order with ID <strong>${savedOrder.orderId}</strong> has been placed successfully.</p>
                       <p>Total Amount: <strong>${totalAmount}</strong></p> `

            })
            
        } catch (error:unknown) {
            console.error("Error sending order confirmation email:", error);
            
        }

        return response.json({
            message : "Order placed successfully",
            data : savedOrder,
            error : false,
            success : true
        })
    } catch(error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating order:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }   
}

export const pricewithDiscount = (price:Number,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

// export async function paymentController...

export async function getOrderDetailsController(request:Request,response:Response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('shippingAddress')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error gettings order detials:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}