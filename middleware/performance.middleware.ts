import { Request, Response, NextFunction } from 'express';
import { trackProductPerformance, trackSearchPerformance } from '../services/productPerformance.service.js';

/**
 * Middleware to track product performance metrics
 */
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Store the original send function
    const originalSend = res.send;

    // Override the send function to capture the response before sending
    res.send = function(body: any): Response {
        try {
            // Parse the response body if it's a string
            const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
            
            // Only process if the response is successful
            if (responseBody && responseBody.success && !responseBody.error) {
                const path = req.path;
                const method = req.method;
                
                // Track product view for individual product details
                // This handles both the product by ID and product by slug endpoints
                if ((path === '/api/v1/products/slug' || path === '/api/v1/products') && 
                    (req.query.productId || req.query.slug) && 
                    responseBody.data && responseBody.data._id) {
                    trackProductPerformance('view', { 
                        productId: responseBody.data._id 
                    });
                }
                
                // Track product search - handle specific search endpoint
                if (path === '/api/v1/products/search-product' && 
                    responseBody.data && Array.isArray(responseBody.data) && 
                    req.query.search) {
                    const productIds = responseBody.data.map((product: any) => product._id);
                    if (productIds.length > 0) {
                        trackSearchPerformance(productIds);
                    }
                }
                
                // Track regular product listing with search parameter
                if (path === '/api/v1/products' && 
                    responseBody.data && Array.isArray(responseBody.data) && 
                    req.query.search) {
                    const productIds = responseBody.data.map((product: any) => product._id);
                    if (productIds.length > 0) {
                        trackSearchPerformance(productIds);
                    }
                }
                
                // Track add to cart - matches the POST /api/v1/carts endpoint
                if (path === '/api/v1/carts' && method === 'POST' && req.body.productId) {
                    trackProductPerformance('add_to_cart', { 
                        productId: req.body.productId 
                    });
                }
                
                // Track purchases - from order completion via cash on delivery
                if (path === '/api/v1/orders/cash-on-delivery' && method === 'POST' && 
                    responseBody.data && responseBody.data.items) {
                    
                    // Process each product in the order
                    const items = responseBody.data.items;
                    if (Array.isArray(items)) {
                        items.forEach((item: any) => {
                            // Handle both embedded product objects and product references
                            const productId = (item.product && item.product._id) ? 
                                item.product._id : item.product;
                            
                            if (productId && item.quantity && item.price) {
                                trackProductPerformance('purchase', {
                                    productId: productId,
                                    quantity: item.quantity,
                                    price: item.price
                                });
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error in performance middleware:', error);
            // Don't block the response if there's an error in tracking
        }
        
        // Call the original send function
        return originalSend.call(this, body);
    };
    
    next();
};