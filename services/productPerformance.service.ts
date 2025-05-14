import { Request } from "express";
import ProductPerformanceModel from "../models/productPerformance.model.js";
import mongoose from "mongoose";

type PerformanceMetricType = 'view' | 'search' | 'add_to_cart' | 'purchase';

interface ProductPerformanceData {
    productId: string | mongoose.Types.ObjectId;
    quantity?: number;
    price?: number;
}

/**
 * Tracks product performance metrics
 * @param metricType - Type of metric (view, search, add_to_cart, purchase)
 * @param data - Product data including productId and optional quantity/price
 */
export const trackProductPerformance = async (
    metricType: PerformanceMetricType,
    data: ProductPerformanceData
): Promise<void> => {
    try {
        const { productId, quantity = 1, price = 0 } = data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find or create performance document for this product
        let performanceDoc = await ProductPerformanceModel.findOne({ productId });
        
        if (!performanceDoc) {
            performanceDoc = new ProductPerformanceModel({
                productId,
                dailyMetrics: []
            });
        }
        
        // Find today's metrics in the dailyMetrics array
        let todayMetrics = performanceDoc.dailyMetrics.find(
            metric => new Date(metric.date).toDateString() === today.toDateString()
        );
        
        // If no metrics exist for today, create a new entry using create method
        if (!todayMetrics) {
            // Create a new metrics entry for today
            performanceDoc.dailyMetrics.push({
                date: today,
                views: 0,
                searches: 0,
                addedToCart: 0,
                purchases: 0,
                totalSold: 0,
                revenue: 0
            } as any); // Use type assertion to bypass TypeScript checking

            // Get the newly created metrics
            todayMetrics = performanceDoc.dailyMetrics[performanceDoc.dailyMetrics.length - 1];
        }
        
        // Update metrics based on the action type
        switch (metricType) {
            case 'view':
                performanceDoc.views += 1;
                todayMetrics.views += 1;
                break;
            case 'search':
                performanceDoc.searches += 1;
                todayMetrics.searches += 1;
                break;
            case 'add_to_cart':
                performanceDoc.addedToCart += 1;
                todayMetrics.addedToCart += 1;
                break;
            case 'purchase':
                performanceDoc.purchases += 1;
                performanceDoc.totalSold += quantity;
                performanceDoc.revenue += price * quantity;
                
                todayMetrics.purchases += 1;
                todayMetrics.totalSold += quantity;
                todayMetrics.revenue += price * quantity;
                break;
        }
        
        // Save the updated document
        await performanceDoc.save();
    } catch (error) {
        console.error('Error tracking product performance:', error);
        // Don't throw the error - performance tracking shouldn't break the app flow
    }
};

/**
 * Track search performance for multiple products
 * @param productIds - Array of product IDs found in search results
 */
export const trackSearchPerformance = async (productIds: string[]): Promise<void> => {
    try {
        // For each product ID, find and update the document
        const bulkOps = [];
        
        for (const productId of productIds) {
            // First, check if document exists
            const exists = await ProductPerformanceModel.findOne({ productId }).lean();
            
            if (exists) {
                // Document exists, check if today's metrics exist
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Check if today's metrics entry exists
                const todayExists = exists.dailyMetrics && 
                    exists.dailyMetrics.some(metric => 
                        new Date(metric.date).toDateString() === today.toDateString()
                    );
                
                if (todayExists) {
                    // Update existing metrics
                    bulkOps.push({
                        updateOne: {
                            filter: { 
                                productId,
                                "dailyMetrics.date": {
                                    $gte: today,
                                    $lt: new Date(today.getTime() + 86400000) // +1 day
                                }
                            },
                            update: { 
                                $inc: { 
                                    searches: 1,
                                    "dailyMetrics.$.searches": 1
                                }
                            }
                        }
                    });
                } else {
                    // Add new daily metrics entry
                    bulkOps.push({
                        updateOne: {
                            filter: { productId },
                            update: { 
                                $inc: { searches: 1 },
                                $push: { 
                                    dailyMetrics: {
                                        date: today,
                                        searches: 1,
                                        views: 0,
                                        addedToCart: 0,
                                        purchases: 0,
                                        totalSold: 0,
                                        revenue: 0
                                    }
                                }
                            }
                        }
                    });
                }
            } else {
                // Create new document with initial metrics
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                bulkOps.push({
                    insertOne: {
                        document: {
                            productId,
                            views: 0,
                            searches: 1,
                            addedToCart: 0,
                            purchases: 0,
                            totalSold: 0,
                            revenue: 0,
                            dailyMetrics: [{
                                date: today,
                                views: 0,
                                searches: 1,
                                addedToCart: 0,
                                purchases: 0,
                                totalSold: 0,
                                revenue: 0
                            }]
                        }
                    }
                });
            }
        }
        
        // Execute bulk operations if any
        if (bulkOps.length > 0) {
            await ProductPerformanceModel.bulkWrite(bulkOps);
        }
    } catch (error) {
        console.error('Error tracking search performance:', error);
    }
};

/**
 * Get performance metrics for a product
 * @param productId - ID of the product
 * @param startDate - Start date for the metrics (optional)
 * @param endDate - End date for the metrics (optional)
 */
export const getProductPerformanceMetrics = async (
    productId: string | mongoose.Types.ObjectId,
    startDate?: Date,
    endDate?: Date
) => {
    try {
        const query: any = { productId };
        
        // If date range is provided, filter dailyMetrics
        if (startDate || endDate) {
            const dateFilter: any = {};
            
            if (startDate) {
                dateFilter.$gte = startDate;
            }
            
            if (endDate) {
                dateFilter.$lte = endDate;
            }
            
            if (Object.keys(dateFilter).length > 0) {
                query['dailyMetrics.date'] = dateFilter;
            }
        }
        
        const performanceData = await ProductPerformanceModel.findOne(query);
        
        if (!performanceData) {
            return {
                productId,
                views: 0,
                searches: 0,
                addedToCart: 0,
                purchases: 0,
                totalSold: 0,
                revenue: 0,
                dailyMetrics: []
            };
        }
        
        // Create a plain object from the Mongoose document
        const result = performanceData.toObject();
        
        // Filter dailyMetrics if date range is provided
        if (startDate || endDate) {
            result.dailyMetrics = result.dailyMetrics.toObject().filter((metric: any) => {
                const metricDate = new Date(metric.date);
                
                if (startDate && metricDate < new Date(startDate)) {
                    return false;
                }
                
                if (endDate && metricDate > new Date(endDate)) {
                    return false;
                }
                
                return true;
            });
        }
        
        return result;
    } catch (error) {
        console.error('Error getting product performance metrics:', error);
        throw error;
    }
};

/**
 * Get top performing products based on specified metric
 * @param metric - Metric to sort by (views, searches, addedToCart, purchases, totalSold, revenue)
 * @param limit - Number of products to return
 */
export const getTopPerformingProducts = async (
    metric: string = 'views',
    limit: number = 10
) => {
    try {
        const sortCriteria: any = {};
        sortCriteria[metric] = -1; // Sort in descending order
        
        const topProducts = await ProductPerformanceModel
            .find({})
            .sort(sortCriteria)
            .limit(limit)
            .populate({
                path: 'productId',
                select: 'title images price discount slug'
            });
        
        return topProducts;
    } catch (error) {
        console.error('Error getting top performing products:', error);
        throw error;
    }
};