import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { AddSubCategoryController, deleteSubCategoryController, getSubCategoryController, updateSubCategoryController } from "../controllers/subCategory.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { admin } from "../middleware/admin.middleware.js";

const subCategoryRouter = Router()

subCategoryRouter.post('/create',asyncHandler(authMiddleware),asyncHandler(admin),asyncHandler(AddSubCategoryController))
subCategoryRouter.post('/get',asyncHandler(getSubCategoryController))
subCategoryRouter.put('/update',asyncHandler(authMiddleware),asyncHandler(admin),asyncHandler(updateSubCategoryController))
subCategoryRouter.delete('/delete',asyncHandler(authMiddleware),asyncHandler(admin),asyncHandler(deleteSubCategoryController))

export default subCategoryRouter