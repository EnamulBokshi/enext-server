import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { createProductController, deleteProductDetails, getProductByCategory, getProductByCategoryAndSubCategory, getProductController, getProductDetails, searchProduct, updateProductDetails } from '../controllers/product.controller.js'
import { admin } from '../middleware/admin.middleware.js'
import asyncHandler from '../utils/asyncHandler.js'

const productRouter = Router()

productRouter.post("/create",asyncHandler(authMiddleware),asyncHandler(admin),asyncHandler(createProductController))
productRouter.post('/get',asyncHandler(getProductController))
productRouter.post("/get-product-by-category",asyncHandler(getProductByCategory))
productRouter.post('/get-pruduct-by-category-and-subcategory',asyncHandler(getProductByCategoryAndSubCategory))
productRouter.post('/get-product-details',asyncHandler(getProductDetails))

//update product
productRouter.put('/update-product-details',asyncHandler(authMiddleware),asyncHandler(admin),asyncHandler(updateProductDetails))

//delete product
productRouter.delete('/delete-product',asyncHandler(authMiddleware),asyncHandler(admin),asyncHandler(deleteProductDetails))

//search product 
productRouter.post('/search-product',asyncHandler(searchProduct))

export default productRouter