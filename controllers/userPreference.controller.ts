import { Request, Response } from "express";
import { getUserPreferences, updateUserPreference } from "../services/userActivity.service.js";
import UserActivityModel from "../models/userActivity.model.js";
import ProductModel from "../models/product.model.js";
import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";

// Get user preferences
export const getUserPreferencesController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        const preferences = await getUserPreferences(userId);

        return res.json({
            message: "User preferences retrieved successfully",
            data: preferences,
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error getting user preferences:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};

// Update user preferences
export const updateUserPreferencesController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        const { preferredCategories, preferredSubCategories, priceRange, favoriteProducts } = req.body;

        const preferences: any = {};

        if (preferredCategories) preferences.preferredCategories = preferredCategories;
        if (preferredSubCategories) preferences.preferredSubCategories = preferredSubCategories;
        if (priceRange) preferences.priceRange = priceRange;
        if (favoriteProducts) preferences.favoriteProducts = favoriteProducts;

        const updatedPreferences = await updateUserPreference(userId, preferences);

        return res.json({
            message: "User preferences updated successfully",
            data: updatedPreferences,
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error updating user preferences:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};

// Get user activity
export const getUserActivityController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        const { page = 1, limit = 20, activityType } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const query: any = { userId };
        if (activityType) query.activityType = activityType;

        const [activities, totalCount] = await Promise.all([
            UserActivityModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('metadata.productId', 'title images price')
                .populate('metadata.categoryId', 'name slug')
                .populate('metadata.subCategoryId', 'name slug'),
            UserActivityModel.countDocuments(query)
        ]);

        return res.json({
            message: "User activity retrieved successfully",
            data: activities,
            totalCount,
            totalPages: Math.ceil(totalCount / Number(limit)),
            currentPage: Number(page),
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error getting user activity:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};

// Get personalized recommendations based on user activity and preferences
export const getPersonalizedRecommendationsController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        // Get user preferences
        const preferences = await getUserPreferences(userId);
        
        // Build query based on preferences
        const query: any = { publish: true };
        
        // Use price range if available
        if (preferences.priceRange && preferences.priceRange.min !== undefined && preferences.priceRange.max !== undefined) {
            query.price = {
                $gte: preferences.priceRange.min,
                $lte: preferences.priceRange.max
            };
        }
        
        // Use preferred categories if available
        if (preferences.preferredCategories && preferences.preferredCategories.length > 0) {
            query.category = {
                $in: preferences.preferredCategories
            };
        }
        
        // Use preferred subcategories if available
        if (preferences.preferredSubCategories && preferences.preferredSubCategories.length > 0) {
            query.sub_category = {
                $in: preferences.preferredSubCategories
            };
        }
        
        // Get recommended products
        const recommendedProducts = await ProductModel.find(query)
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('category', 'name slug')
            .populate('sub_category', 'name slug');
            
        // Find recently viewed products
        const recentlyViewed = await UserActivityModel.find({
            userId,
            activityType: 'product_view'
        })
        .sort({ createdAt: -1 })
        .limit(5);
        
        const viewedProductIds = recentlyViewed.map(activity => 
            activity.metadata?.productId
        ).filter(Boolean);
        
        // Get similar products to recently viewed
        const similarProducts = viewedProductIds.length > 0 ? 
            await ProductModel.find({
                _id: { $nin: viewedProductIds },
                category: query.category
            })
            .limit(5)
            .populate('category', 'name slug')
            .populate('sub_category', 'name slug') : [];
        
        return res.json({
            message: "Personalized recommendations retrieved successfully",
            data: {
                recommendedProducts,
                recentlyViewed: viewedProductIds,
                similarProducts
            },
            error: false,
            success: true
        });
    } catch (error: unknown) {
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error getting personalized recommendations:", errorMessage);
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};