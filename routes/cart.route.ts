import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { addToCartItemController, deleteCartItemQtyController, getCartItemController, getCartItemsController, updateCartItemQtyController } from "../controllers/cart.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
const cartRouter = Router()

cartRouter.post('/',asyncHandler(authMiddleware),asyncHandler(addToCartItemController))
cartRouter.get("/",asyncHandler(authMiddleware),asyncHandler(getCartItemsController))
cartRouter.put('/update-qty',asyncHandler(authMiddleware),asyncHandler(updateCartItemQtyController))
cartRouter.delete('/:id',asyncHandler(authMiddleware),asyncHandler(deleteCartItemQtyController))
cartRouter.get('/:id',asyncHandler(authMiddleware),asyncHandler(getCartItemController))

export default cartRouter