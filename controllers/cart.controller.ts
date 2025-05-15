import CartProductModel from "../models/cart.model.js";
import UserModel from "../models/user.model.js";
import { Response, Request } from "express";
import { trackUserActivity } from "../services/userActivity.service.js";
import { reserveInventory, releaseInventory } from "../services/inventory.service.js";
import InventoryModel from "../models/inventory.model.js";

export const addToCartItemController = async(request:Request,response:Response)=>{
    try {
        const  userId = request.userId
        const { productId } = request.body || request.query
        

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

        // Check inventory availability before adding to cart
        const inventory = await InventoryModel.findOne({ productId });
        if (!inventory || inventory.availableStock < 1) {
            return response.status(400).json({
                message: "Product is out of stock",
                error: true,
                success: false
            });
        }

        // Reserve inventory for the item
        const reserved = await reserveInventory(productId, 1);
        if (!reserved) {
            return response.status(400).json({
                message: "Unable to reserve inventory for this product",
                error: true,
                success: false
            });
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

        // Get current quantity to calculate difference
        const currentQty = cartItem.quantity;
        const qtyDifference = qty - currentQty;

        if (qtyDifference > 0) {
            // Increasing quantity - check and reserve additional inventory
            const inventory = await InventoryModel.findOne({ productId: cartItem.productId });
            if (!inventory || inventory.availableStock < qtyDifference) {
                return response.status(400).json({
                    message: "Not enough stock available",
                    error: true,
                    success: false
                });
            }

            // Reserve additional inventory
            if (!cartItem.productId) {
                return response.status(400).json({
                    message: "Product ID is missing for the cart item",
                    error: true,
                    success: false
                });
            }
            const reserved = await reserveInventory(cartItem.productId.toString(), qtyDifference);
            if (!reserved) {
                return response.status(400).json({
                    message: "Unable to reserve additional inventory",
                    error: true,
                    success: false
                });
            }
        } else if (qtyDifference < 0) {
            // Decreasing quantity - release extra inventory
            if (cartItem.productId) {
                await releaseInventory(cartItem.productId.toString(), Math.abs(qtyDifference));
            } else {
                return response.status(400).json({
                    message: "Product ID is missing for the cart item",
                    error: true,
                    success: false
                });
            }
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

      // Release the reserved inventory
      if (cartItem.productId) {
          await releaseInventory(cartItem.productId.toString(), cartItem.quantity);
      } else {
          return response.status(400).json({
              message: "Product ID is missing for the cart item",
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

        // Get all cart items to release their inventory
        const cartItems = await CartProductModel.find({ userId: userId });
        
        // Release inventory for each item
        for (const item of cartItems) {
            if (item.productId) {
                await releaseInventory(item.productId.toString(), item.quantity);
            }
        }

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
