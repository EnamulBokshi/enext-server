import { Request, Response } from "express";
import ProductRatingModel from "../models/productRating.model.js";
import ProductModel from "../models/product.model.js";
import { trackUserActivity } from "../services/userActivity.service.js";

/**
 * Create a new product rating
 */
export const createProductRating = async (req: Request, res: Response) => {
    try {
        const userId = req.userId; // From auth middleware
        const { productId, rating, review } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        if (!productId || !rating) {
            return res.status(400).json({
                message: "Product ID and rating are required",
                error: true,
                success: false
            });
        }

        // Validate if product exists
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        // Check if user has already rated this product
        const existingRating = await ProductRatingModel.findOne({
            productId,
            userId
        });

        if (existingRating) {
            return res.status(400).json({
                message: "You have already rated this product. Use update instead.",
                error: true,
                success: false
            });
        }

        // Create new rating
        const newRating = new ProductRatingModel({
            productId,
            userId,
            rating,
            review
        });

        const savedRating = await newRating.save();

        // Track user activity
        trackUserActivity(req, 'product_rating', {
            productId,
            rating,
            ratingId: savedRating._id
        });

        return res.status(201).json({
            message: "Rating submitted successfully",
            data: savedRating,
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error creating product rating:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};

/**
 * Get all ratings for a specific product
 */
export const getProductRatings = async (req: Request, res: Response) => {
    try {
        const { productId, page = 1, limit = 10 } = req.query;
        
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get ratings with user details
        const [ratings, count] = await Promise.all([
            ProductRatingModel.find({ productId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('userId', 'name avatar'),
            ProductRatingModel.countDocuments({ productId })
        ]);

        // Calculate average rating
        const ratingSum = await ProductRatingModel.aggregate([
            { $match: { productId: productId } },
            { $group: { _id: null, average: { $avg: '$rating' } } }
        ]);

        const averageRating = ratingSum.length > 0 ? ratingSum[0].average : 0;

        return res.status(200).json({
            message: "Product ratings retrieved successfully",
            data: ratings,
            totalCount: count,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum,
            averageRating: parseFloat(averageRating.toFixed(1)),
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error getting product ratings:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};

/**
 * Update an existing product rating
 */
export const updateProductRating = async (req: Request, res: Response) => {
    try {
        const userId = req.userId; // From auth middleware
        const { ratingId } = req.params;
        const { rating, review } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        if (!ratingId) {
            return res.status(400).json({
                message: "Rating ID is required",
                error: true,
                success: false
            });
        }

        // Find the rating and make sure it belongs to the current user
        const existingRating = await ProductRatingModel.findOne({
            _id: ratingId,
            userId
        });

        if (!existingRating) {
            return res.status(404).json({
                message: "Rating not found or you are not authorized to update it",
                error: true,
                success: false
            });
        }

        // Update fields
        if (rating !== undefined) existingRating.rating = rating;
        if (review !== undefined) existingRating.review = review;
        
        const updatedRating = await existingRating.save();

        return res.status(200).json({
            message: "Rating updated successfully",
            data: updatedRating,
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error updating product rating:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};

/**
 * Delete a product rating
 */
export const deleteProductRating = async (req: Request, res: Response) => {
    try {
        const userId = req.userId; // From auth middleware
        const { ratingId } = req.params;
        
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        if (!ratingId) {
            return res.status(400).json({
                message: "Rating ID is required",
                error: true,
                success: false
            });
        }

        // Find the rating and verify ownership
        const existingRating = await ProductRatingModel.findOne({
            _id: ratingId,
            userId
        });

        if (!existingRating) {
            return res.status(404).json({
                message: "Rating not found or you are not authorized to delete it",
                error: true,
                success: false
            });
        }

        // Delete the rating
        await ProductRatingModel.deleteOne({ _id: ratingId });

        return res.status(200).json({
            message: "Rating deleted successfully",
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error deleting product rating:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};

/**
 * Get a specific rating by ID
 */
export const getProductRatingById = async (req: Request, res: Response) => {
    try {
        const { ratingId } = req.params;
        
        if (!ratingId) {
            return res.status(400).json({
                message: "Rating ID is required",
                error: true,
                success: false
            });
        }

        const rating = await ProductRatingModel.findById(ratingId)
            .populate('userId', 'name avatar')
            .populate('productId', 'title images price');

        if (!rating) {
            return res.status(404).json({
                message: "Rating not found",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Rating retrieved successfully",
            data: rating,
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error getting product rating:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};

/**
 * Get user's ratings
 */
export const getUserRatings = async (req: Request, res: Response) => {
    try {
        const userId = req.userId; // From auth middleware
        const { page = 1, limit = 10 } = req.query;
        
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        const [ratings, count] = await Promise.all([
            ProductRatingModel.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('productId', 'title images price'),
            ProductRatingModel.countDocuments({ userId })
        ]);

        return res.status(200).json({
            message: "User ratings retrieved successfully",
            data: ratings,
            totalCount: count,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum,
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error getting user ratings:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};


/**
 * Get average rating for a specific product
 */
export const getAverageRating = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        const ratingSum = await ProductRatingModel.aggregate([
            { $match: { productId: productId } },
            { $group: { _id: null, average: { $avg: '$rating' } } }
        ]);

        const averageRating = ratingSum.length > 0 ? ratingSum[0].average : 0;

        return res.status(200).json({
            message: "Average rating retrieved successfully",
            data: parseFloat(averageRating.toFixed(1)),
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error getting average rating:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
}


/**
 * Get ratings by user ID
 */
export const getRatingsByUserId = async (req: Request, res: Response) => {  
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                error: true,
                success: false
            });
        }

        const ratings = await ProductRatingModel.find({ userId })
            .populate('productId', 'title images price');

        if (!ratings || ratings.length === 0) {
            return res.status(404).json({
                message: "No ratings found for this user",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "User ratings retrieved successfully",
            data: ratings,
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error getting user ratings:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
}

/**
 * Get ratings by product ID
 */

export const getRatingsByProductId = async (req: Request, res: Response) => {  
    try {
        const { productId } = req.params;
        
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        const ratings = await ProductRatingModel.find({ productId })
            .populate('userId', 'name avatar');

        if (!ratings || ratings.length === 0) {
            return res.status(404).json({
                message: "No ratings found for this product",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Product ratings retrieved successfully",
            data: ratings,
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error getting product ratings:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};