import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { AddSubCategoryController, deleteSubCategoryController, getSubCategoryController, updateSubCategoryController } from "../controllers/subCategory.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { admin } from "../middleware/admin.middleware.js";
import upload from "../middleware/multer.middleware.js";

const subCategoryRouter = Router()

subCategoryRouter.post('/', asyncHandler(authMiddleware), asyncHandler(admin), upload.single('image'), asyncHandler(AddSubCategoryController))
subCategoryRouter.get('/', asyncHandler(getSubCategoryController))
subCategoryRouter.put('/', asyncHandler(authMiddleware), asyncHandler(admin), upload.single('image'), asyncHandler(updateSubCategoryController))
subCategoryRouter.delete('/', asyncHandler(authMiddleware), asyncHandler(admin), asyncHandler(deleteSubCategoryController))

export default subCategoryRouter