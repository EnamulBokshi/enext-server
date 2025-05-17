import { authMiddleware } from './../middleware/auth.middleware.js';

import { Router } from 'express'
import uploadImageController from '../controllers/uploadImage.controller.js'
import upload from '../middleware/multer.middleware.js'
import asyncHandler from '../utils/asyncHandler.js';
import { admin } from '../middleware/admin.middleware.js';

const uploadRouter = Router()

uploadRouter.post("/upload", asyncHandler(authMiddleware), asyncHandler(admin),upload.array("images", 10), asyncHandler(uploadImageController))

export default uploadRouter