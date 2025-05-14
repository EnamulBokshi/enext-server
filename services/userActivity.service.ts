import UserActivityModel from "../models/userActivity.model.js";
import UserPreferenceModel from "../models/userPreference.model.js";
import { Request } from "express";

/**
 * Track a user activity
 */
export const trackUserActivity = async (
    req: Request,
    activityType: string,
    metadata: any = {}
) => {
    try {
        const userId = req.userId;
        if (!userId) return; // Skip if no user is logged in

        // Get IP address from request
        const ipAddress = 
            req.headers['x-forwarded-for'] as string || 
            req.socket.remoteAddress || 
            '';

        // Create activity log
        const activity = new UserActivityModel({
            userId,
            activityType,
            metadata,
            ipAddress: ipAddress.split(',')[0].trim(),
            userAgent: req.headers['user-agent'] || '',
            sessionId: req.cookies?.sessionId || '',
        });

        await activity.save();
        
        // Update user preferences based on activity
        await updateUserPreferences(userId, activityType, metadata);
        
        return activity;
    } catch (error) {
        console.error('Error tracking user activity:', error);
        // We don't throw here to prevent breaking the main flow
        return null;
    }
};

/**
 * Update user preferences based on their activity
 */
const updateUserPreferences = async (
    userId: string,
    activityType: string,
    metadata: any
) => {
    try {
        // Find or create user preferences
        let userPreference = await UserPreferenceModel.findOne({ userId });
        
        if (!userPreference) {
            userPreference = new UserPreferenceModel({ userId });
        }
        
        // Update preferences based on activity type
        switch (activityType) {
            case 'product_view':
                if (metadata.productId) {
                    // Increment view count for this product
                    // You could use this to determine favorite products
                }
                break;
                
            case 'search':
                if (metadata.searchQuery) {
                    // Add to search history
                    userPreference.searchHistory.push({
                        query: metadata.searchQuery,
                        timestamp: new Date()
                    });
                    
                    // Limit search history to last 20 searches
                    if (userPreference.searchHistory.length > 20) {
                        userPreference.searchHistory.splice(0, userPreference.searchHistory.length - 20);
                    }
                }
                break;
                
            case 'category_view':
                if (metadata.categoryId) {
                    // Add to preferred categories if not exists
                    if (!userPreference.preferredCategories.includes(metadata.categoryId)) {
                        userPreference.preferredCategories.push(metadata.categoryId);
                    }
                }
                
                if (metadata.subCategoryId) {
                    // Add to preferred sub-categories if not exists
                    if (!userPreference.preferredSubCategories.includes(metadata.subCategoryId)) {
                        userPreference.preferredSubCategories.push(metadata.subCategoryId);
                    }
                }
                break;
                
            case 'favorites':
                if (metadata.productId) {
                    // Add to favorite products if not exists
                    if (!userPreference.favoriteProducts.includes(metadata.productId)) {
                        userPreference.favoriteProducts.push(metadata.productId);
                    }
                }
                break;
                
            // Add more activity types and their handling as needed
        }
        
        await userPreference.save();
        return userPreference;
    } catch (error) {
        console.error('Error updating user preferences:', error);
        return null;
    }
};

/**
 * Get user preferences
 */
export const getUserPreferences = async (userId: string) => {
    try {
        let userPreference = await UserPreferenceModel.findOne({ userId })
            .populate('preferredCategories')
            .populate('preferredSubCategories')
            .populate('favoriteProducts');
            
        if (!userPreference) {
            userPreference = new UserPreferenceModel({ userId });
            await userPreference.save();
        }
        
        return userPreference;
    } catch (error) {
        console.error('Error getting user preferences:', error);
        throw error;
    }
};

/**
 * Update user preference manually
 */
export const updateUserPreference = async (userId: string, preferences: any) => {
    try {
        const userPreference = await UserPreferenceModel.findOneAndUpdate(
            { userId },
            { $set: preferences },
            { new: true, upsert: true }
        );
        
        return userPreference;
    } catch (error) {
        console.error('Error updating user preference:', error);
        throw error;
    }
};