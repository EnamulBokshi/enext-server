import { authMiddleware } from './../middleware/auth.middleware.js';

import { Router } from 'express'
import uploadImageController from '../controllers/uploadImage.controller.js'
import upload from '../middleware/multer.middleware.js'
import asyncHandler from '../utils/asyncHandler.js';

const uploadRouter = Router()

uploadRouter.post("/upload", asyncHandler(authMiddleware), upload.array("images", 10), asyncHandler(uploadImageController))

export default uploadRouter