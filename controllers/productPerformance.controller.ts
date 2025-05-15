import { Request, Response } from 'express';
import { getProductPerformanceMetrics, getTopPerformingProducts } from '../services/productPerformance.service.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Get performance metrics for a specific product
 */
export const getProductPerformance = asyncHandler(async (req: Request, res: Response) => {
    const { productId, startDate, endDate } = req.query;
    
    if (!productId) {
        return res.status(400).json({
            message: "Product ID is required",
            error: true,
            success: false
        });
    }
    
    let startDateObj: Date | undefined;
    let endDateObj: Date | undefined;
    
    if (startDate) {
        startDateObj = new Date(startDate as string);
    }
    
    if (endDate) {
        endDateObj = new Date(endDate as string);
    }
    
    const performanceData = await getProductPerformanceMetrics(
        productId as string,
        startDateObj,
        endDateObj
    );
    
    return res.json({
        message: "Product performance data",
        data: performanceData,
        error: false,
        success: true
    });
});

/**
 * Get top performing products based on specified metric
 */
export const getTopProducts = asyncHandler(async (req: Request, res: Response) => {
    const { metric = 'views', limit = 10 } = req.query;
    
    // Validate metric type
    const validMetrics = ['views', 'searches', 'addedToCart', 'purchases', 'totalSold', 'revenue'];
    if (!validMetrics.includes(metric as string)) {
        return res.status(400).json({
            message: `Invalid metric type. Valid types are: ${validMetrics.join(', ')}`,
            error: true,
            success: false
        });
    }
    
    const topProducts = await getTopPerformingProducts(
        metric as string,
        parseInt(limit as string) || 10
    );
    
    return res.json({
        message: `Top products by ${metric}`,
        data: topProducts,
        error: false,
        success: true
    });
});