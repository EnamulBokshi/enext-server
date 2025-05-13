import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { addToCartItemController, deleteCartItemQtyController, getCartItemController, updateCartItemQtyController } from "../controllers/cart.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
const cartRouter = Router()

cartRouter.post('/create',asyncHandler(authMiddleware),asyncHandler(addToCartItemController))
cartRouter.get("/get",asyncHandler(authMiddleware),asyncHandler(getCartItemController))
cartRouter.put('/update-qty',asyncHandler(authMiddleware),asyncHandler(updateCartItemQtyController))
cartRouter.delete('/delete-cart-item',asyncHandler(authMiddleware),asyncHandler(deleteCartItemQtyController))

export default cartRouter