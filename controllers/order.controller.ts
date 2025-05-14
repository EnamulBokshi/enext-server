// import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cart.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

import { Response, Request } from "express";
import { OrderPayload } from '../type.js';

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

// export async function paymentController(request:Request,response:Response){
//     try {
//         const userId = request.userId // auth middleware 
//         const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

//         const user = await UserModel.findById(userId)

//         const line_items  = list_items.map(item =>{
//             return{
//                price_data : {
//                     currency : 'bdt',
//                     product_data : {
//                         name : item.productId.name,
//                         images : item.productId.image,
//                         metadata : {
//                             productId : item.productId._id
//                         }
//                     },
//                     unit_amount : pricewithDiscount(item.productId.price,item.productId.discount) * 100   
//                },
//                adjustable_quantity : {
//                     enabled : true,
//                     minimum : 1
//                },
//                quantity : item.quantity 
//             }
//         })

//         const params = {
//             submit_type : 'pay',
//             mode : 'payment',
//             payment_method_types : ['card'],
//             customer_email : user.email,
//             metadata : {
//                 userId : userId,
//                 addressId : addressId
//             },
//             line_items : line_items,
//             success_url : `${process.env.FRONTEND_URL}/success`,
//             cancel_url : `${process.env.FRONTEND_URL}/cancel`
//         }

//         const session = await Stripe.checkout.sessions.create(params)

//         return response.status(200).json(session)

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }


// const getOrderProductItems = async({
//     lineItems,
//     userId,
//     addressId,
//     paymentId,
//     payment_status,
//  })=>{
//     const productList = []

//     if(lineItems?.data?.length){
//         for(const item of lineItems.data){
//             const product = await Stripe.products.retrieve(item.price.product)

//             const paylod = {
//                 userId : userId,
//                 orderId : `ORD-${new mongoose.Types.ObjectId()}`,
//                 productId : product.metadata.productId, 
//                 product_details : {
//                     name : product.name,
//                     image : product.images
//                 } ,
//                 paymentId : paymentId,
//                 payment_status : payment_status,
//                 delivery_address : addressId,
//                 subTotalAmt  : Number(item.amount_total / 100),
//                 totalAmt  :  Number(item.amount_total / 100),
//             }

//             productList.push(paylod)
//         }
//     }

//     return productList
// }

//http://localhost:8080/api/order/webhook
// export async function webhookStripe(request,response){
//     const event = request.body;
//     const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

//     console.log("event",event)

//     // Handle the event
//   switch (event.type) {
//     case 'checkout.session.completed':
//       const session = event.data.object;
//       const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
//       const userId = session.metadata.userId
//       const orderProduct = await getOrderProductItems(
//         {
//             lineItems : lineItems,
//             userId : userId,
//             addressId : session.metadata.addressId,
//             paymentId  : session.payment_intent,
//             payment_status : session.payment_status,
//         })
    
//       const order = await OrderModel.insertMany(orderProduct)

//         console.log(order)
//         if(Boolean(order[0])){
//             const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
//                 shopping_cart : []
//             })
//             const removeCartProductDB = await CartProductModel.deleteMany({ userId : userId})
//         }
//       break;
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Return a response to acknowledge receipt of the event
//   response.json({received: true});
// }


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