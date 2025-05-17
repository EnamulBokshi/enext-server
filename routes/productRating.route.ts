import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { 
    createProductRating, 
    deleteProductRating, 
    getProductRatingById, 
    getProductRatings, 
    getUserRatings, 
    updateProductRating 
} from "../controllers/productRating.controller.js";

const productRatingRouter = Router();

/**
 * @route POST /api/v1/ratings/
 * @description Create a new product rating
 * @access Private - requires authentication
 */
productRatingRouter.post('/', 
    asyncHandler(authMiddleware), 
    asyncHandler(createProductRating)
);

/**
 * @route GET /api/v1/ratings/product
 * @description Get all ratings for a specific product
 * @access Public
 */
productRatingRouter.get('/product', 
    asyncHandler(getProductRatings)
);

/**
 * @route GET /api/v1/ratings/:ratingId
 * @description Get a specific rating by ID
 * @access Public
 */
productRatingRouter.get('/:ratingId', 
    asyncHandler(getProductRatingById)
);

/**
 * @route PUT /api/v1/ratings/:ratingId
 * @description Update a product rating
 * @access Private - requires authentication and ownership
 */
productRatingRouter.put('/:ratingId', 
    asyncHandler(authMiddleware), 
    asyncHandler(updateProductRating)
);

/**
 * @route DELETE /api/v1/ratings/:ratingId
 * @description Delete a product rating
 * @access Private - requires authentication and ownership
 */
productRatingRouter.delete('/:ratingId', 
    asyncHandler(authMiddleware), 
    asyncHandler(deleteProductRating)
);

/**
 * @route GET /api/v1/ratings/user/me
 * @description Get ratings submitted by current user
 * @access Private - requires authentication
 */
productRatingRouter.get('/user/me', 
    asyncHandler(authMiddleware), 
    asyncHandler(getUserRatings)
);

export default productRatingRouter;