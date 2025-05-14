import CartProductModel from "../models/cart.model.js";
import UserModel from "../models/user.model.js";
import { Response, Request } from "express";
import { trackUserActivity } from "../services/userActivity.service.js";

export const addToCartItemController = async(request:Request,response:Response)=>{
    try {
        const  userId = request.userId
        const { productId } = request.body
        
        if(!productId){
            return response.status(402).json({
                message : "Provide productId",
                error : true,
                success : false
            })
        }

        const checkItemCart = await CartProductModel.findOne({
            userId : userId,
            productId : productId
        })

        if(checkItemCart){
            return response.status(400).json({
                message : "Item already in cart"
            })
        }

        const cartItem = new CartProductModel({
            quantity : 1,
            userId : userId,
            productId : productId
        })
        const save = await cartItem.save()

        const updateCartUser = await UserModel.updateOne({ _id : userId},{
            $push : { 
                shopping_cart : productId
            }
        })

        // Track add to cart activity
        trackUserActivity(request, 'add_to_cart', {
            productId,
            quantity: 1
        });

        return response.json({
            data : save,
            message : "Item add successfully",
            error : false,
            success : true
        })

        
    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating cart:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

export const getCartItemsController = async(request:Request,response:Response)=>{
    try {
        const userId = request.userId

        const cartItem =  await CartProductModel.find({
            userId : userId
        }).populate('productId')

        return response.json({
            data : cartItem,
            error : false,
            success : true
        })

    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating cart:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

export const updateCartItemQtyController = async(request:Request,response:Response)=>{
    try {
        const userId = request.userId 
        const { _id, qty } = request.body

        if(!_id ||  !qty){
            return response.status(400).json({
                message : "provide _id, qty"
            })
        }

        const cartItem = await CartProductModel.findOne({ _id, userId });
        if (!cartItem) {
            return response.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false
            });
        }

        const updateCartitem = await CartProductModel.updateOne({
            _id : _id,
            userId : userId
        },{
            quantity : qty
        })

        // Track cart update activity
        trackUserActivity(request, 'add_to_cart', {
            productId: cartItem.productId,
            quantity: qty,
            action: 'update_quantity'
        });

        return response.json({
            message : "Update cart",
            success : true,
            error : false, 
            data : updateCartitem
        })

    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating cart:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

export const deleteCartItemQtyController = async(request:Request,response:Response)=>{
    try {
      const userId = request.userId // middleware
      const { id } = request.params 
      const _id = id?.toString()
      console.log(id)
      if(!_id){
        return response.status(400).json({
            message : "Provide _id",
            error : true,
            success : false
        })
      }

      // Get the cart item before deleting it for tracking
      const cartItem = await CartProductModel.findOne({ _id, userId });
      if (!cartItem) {
        return response.status(404).json({
            message: "Cart item not found",
            error: true,
            success: false
        });
      }

      const deleteCartItem = await CartProductModel.deleteOne({_id : id, userId : userId })

      // Track remove from cart activity
      trackUserActivity(request, 'remove_from_cart', {
        productId: cartItem.productId,
        quantity: cartItem.quantity
      });

      return response.json({
        message : "Item remove",
        error : false,
        success : true,
        data : deleteCartItem
      })

    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating cart:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}

// get a single cart item
export const getCartItemController = async(request:Request,response:Response)=>{
    try {
        const userId = request.userId
        const { id } = request.params

        if(!id){
            return response.status(400).json({
                message : "Provide _id",
                error : true,
                success : false
            })
        }

        const cartItem = await CartProductModel.findOne({ _id : id, userId : userId }).populate('productId')

        return response.json({
            message : "Cart item",
            data : cartItem,
            error : false,
            success : true
        })

    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating cart:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}
export const clearCartItemController = async(request:Request,response:Response)=>{
    try {
        const userId = request.userId

        const clearCartItem = await CartProductModel.deleteMany({ userId : userId })

        return response.json({
            message : "Clear cart",
            data : clearCartItem,
            error : false,
            success : true
        })

    } catch (error:unknown) {
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error creating cart:", errorMessage);
        return response.status(500).json({
            message : errorMessage,
            error : true,
            success : false
        })
    }
}
