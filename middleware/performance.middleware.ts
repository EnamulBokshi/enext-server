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
                
                // Track product view
                if (path.includes('/product/details') && responseBody.data && responseBody.data._id) {
                    trackProductPerformance('view', { 
                        productId: responseBody.data._id 
                    });
                }
                
                // Track product search
                if ((path.includes('/product/search') || path.includes('/product/get')) && 
                    responseBody.data && Array.isArray(responseBody.data)) {
                    // Extract product IDs from search results
                    const productIds = responseBody.data.map((product: any) => product._id);
                    if (productIds.length > 0) {
                        trackSearchPerformance(productIds);
                    }
                }
                
                // Track add to cart (from cart API)
                if (path.includes('/cart/add') && method === 'POST' && req.body.productId) {
                    trackProductPerformance('add_to_cart', { 
                        productId: req.body.productId 
                    });
                }
                
                // Track purchases (from order completion)
                if (path.includes('/order/create') && method === 'POST' && 
                    responseBody.data && responseBody.data.products) {
                    
                    // Process each product in the order
                    const products = responseBody.data.products;
                    if (Array.isArray(products)) {
                        products.forEach((product: any) => {
                            if (product.productId && product.quantity && product.price) {
                                trackProductPerformance('purchase', {
                                    productId: product.productId,
                                    quantity: product.quantity,
                                    price: product.price
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