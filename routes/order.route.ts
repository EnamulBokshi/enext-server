import { Router } from 'express'

import { authMiddleware } from '../middleware/auth.middleware.js'
import { CashOnDeliveryOrderController, getOrderDetailsController } from '../controllers/order.controller.js'
import asyncHandler from '../utils/asyncHandler.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",asyncHandler(authMiddleware),asyncHandler(CashOnDeliveryOrderController))
// orderRouter.post('/checkout',auth,paymentController)
// orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",asyncHandler(authMiddleware),asyncHandler(getOrderDetailsController))

export default orderRouter