import { NextFunction, Request, Response } from "express";
import { trackUserActivity } from "../services/userActivity.service.js";

export const activityTrackingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Only track activity for authenticated users
        if (req.userId) {
            // Store the original end method
            const originalEnd = res.end;
            
            // Override the end method
            res.end = function (this: Response, ...args: any[]) {
                // Capture route information
                const url = req.originalUrl || req.url;
                const method = req.method;
                
                // Track activity based on route pattern
                if (url.includes('/products') && method === 'GET') {
                    const productId = req.params.slug || req.query.productId;
                    if (productId) {
                        trackUserActivity(req, 'product_view', { 
                            productId, 
                            page: url 
                        });
                    } else {
                        trackUserActivity(req, 'page_view', { 
                            page: 'products_listing' 
                        });
                    }
                } 
                else if (url.includes('/categories') && method === 'GET') {
                    const categoryId = req.query.id;
                    if (categoryId) {
                        trackUserActivity(req, 'category_view', { 
                            categoryId, 
                            page: url 
                        });
                    }
                }
                else if (url.includes('/subcategories') && method === 'GET') {
                    trackUserActivity(req, 'page_view', { 
                        page: 'subcategories_listing' 
                    });
                }
                else if (url.includes('/search-product') && method === 'GET') {
                    const searchQuery = req.query.search;
                    if (searchQuery) {
                        trackUserActivity(req, 'search', { 
                            searchQuery, 
                            page: url 
                        });
                    }
                }
                
                // Call the original end method
                return originalEnd.apply(this, args as [chunk: any, encoding: BufferEncoding, cb?: (() => void) | undefined]);
            };
        }
        
        next();
    } catch (error) {
        console.error('Error in activity tracking middleware:', error);
        next(); // Continue even if tracking fails
    }
};