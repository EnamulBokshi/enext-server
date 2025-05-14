import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { createProductController, deleteProductDetails, getProductByCategory, getProductByCategoryAndSubCategory, getProductBySlug, getProductController, getProductDetails, searchProduct, updateProductDetails } from '../controllers/product.controller.js'
import { admin } from '../middleware/admin.middleware.js'
import asyncHandler from '../utils/asyncHandler.js'
import upload from '../middleware/multer.middleware.js'

const productRouter = Router()

// Create a more flexible upload middleware that accepts multiple field names
const productUpload = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'image', maxCount: 5 },
  { name: 'files', maxCount: 5 },
  { name: 'productImages', maxCount: 5 }
]);

// Create product route (requires auth, admin rights, and file upload)
productRouter.post("/", asyncHandler(authMiddleware), asyncHandler(admin), productUpload, asyncHandler(createProductController))

// Get products route
productRouter.get('/', asyncHandler(getProductController))
productRouter.get("/category", asyncHandler(getProductByCategory))
productRouter.get('/category-and-subcategory', asyncHandler(getProductByCategoryAndSubCategory))
// productRouter.get('/:slug', asyncHandler(getProductDetails))
// Get product by slug
// productRouter.get('/slug/:slug', asyncHandler(getProductBySlug))
// Alternative route using query parameter for slug
productRouter.get('/slug', asyncHandler(getProductBySlug))

//update product
productRouter.put('/update-product-details', asyncHandler(authMiddleware), asyncHandler(admin), productUpload, asyncHandler(updateProductDetails))

//delete product
productRouter.delete('/delete-product', asyncHandler(authMiddleware), asyncHandler(admin), asyncHandler(deleteProductDetails))

//search product 
productRouter.get('/search-product', asyncHandler(searchProduct))

export default productRouter