import { authMiddleware } from './../middleware/auth.middleware.js';
import { Router } from 'express'
import { addAddressController, deleteAddresscontroller, getAddressController, updateAddressController } from '../controllers/address.controller.js'
import asyncHandler from '../utils/asyncHandler.js';

const addressRouter = Router()

addressRouter.post('/',asyncHandler(authMiddleware),asyncHandler(addAddressController))
addressRouter.get("/",asyncHandler(authMiddleware),asyncHandler(getAddressController))
addressRouter.put('/',asyncHandler(authMiddleware),asyncHandler(updateAddressController))
addressRouter.delete("/disable",asyncHandler(authMiddleware),asyncHandler(deleteAddresscontroller))

export default addressRouter