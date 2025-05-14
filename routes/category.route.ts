import { Router } from 'express'
import { AddCategoryController, deleteCategoryController, getCategoryController, updateCategoryController } from '../controllers/category.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import asyncHandler from '../utils/asyncHandler.js'
import { admin } from '../middleware/admin.middleware.js'
import upload from '../middleware/multer.middleware.js'
const categoryRouter = Router()

categoryRouter.post("/", asyncHandler(authMiddleware), upload.single('image'), asyncHandler(AddCategoryController))
categoryRouter.get('/', asyncHandler(getCategoryController))
categoryRouter.put('/', asyncHandler(authMiddleware), asyncHandler(admin), upload.single('image'), asyncHandler(updateCategoryController))
categoryRouter.delete("/", asyncHandler(authMiddleware), asyncHandler(admin), asyncHandler(deleteCategoryController))

export default categoryRouter