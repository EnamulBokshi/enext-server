import { Router } from 'express'

import { authMiddleware } from '../middleware/auth.middleware.js'
import { cancelOrderController, CashOnDeliveryOrderController, getOrderByIdController, getOrderDetailsController, updateOrderStatusController } from '../controllers/order.controller.js'
import asyncHandler from '../utils/asyncHandler.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery", asyncHandler(authMiddleware), asyncHandler(CashOnDeliveryOrderController))
// orderRouter.post('/checkout',auth,paymentController)
// orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/", asyncHandler(authMiddleware), asyncHandler(getOrderDetailsController));
orderRouter.get("/:orderId", asyncHandler(authMiddleware), asyncHandler(getOrderByIdController));
orderRouter.put("/order-cancel/", asyncHandler(authMiddleware), asyncHandler(cancelOrderController));
orderRouter.put("/update-order-status/",asyncHandler(authMiddleware), asyncHandler(updateOrderStatusController));

export default orderRouter