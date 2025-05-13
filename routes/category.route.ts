import { Router } from 'express'
import { AddCategoryController, deleteCategoryController, getCategoryController, updateCategoryController } from '../controllers/category.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import asyncHandler from '../utils/asyncHandler.js'
import { admin } from '../middleware/admin.middleware.js'
const categoryRouter = Router()

categoryRouter.post("/add-category",asyncHandler(authMiddleware),asyncHandler(admin), asyncHandler(AddCategoryController))
categoryRouter.get('/get',asyncHandler(getCategoryController))
categoryRouter.put('/update',asyncHandler(authMiddleware),asyncHandler(admin), asyncHandler(updateCategoryController))
categoryRouter.delete("/delete",asyncHandler(authMiddleware),asyncHandler(admin), asyncHandler(deleteCategoryController))

export default categoryRouter