import { NextFunction, Request, Response } from "express";
import InventoryModel from "../models/inventory.model.js";
import ProductModel from "../models/product.model.js";
import sendEmail from "../services/sendEmail.service.js";

/**
 * Middleware to check inventory thresholds after inventory-related operations
 * Sends email alerts to admin when products reach or fall below threshold levels
 */
export const inventoryAlertMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Store the original send method
    const originalSend = res.send;

    // Override the send method to check inventory after response
    res.send = function(body: any): Response {
        // Call the original send function first
        const result = originalSend.call(this, body);
        
        // Don't block the response - run inventory check asynchronously
        setTimeout(async () => {
            try {
                // Find all products that have hit or fallen below threshold
                const lowStockItems = await InventoryModel.find({
                    $expr: {
                        $lte: ["$availableStock", "$threshold"]
                    }
                }).populate({
                    path: 'productId',
                    select: 'title images'
                });

                // If there are low stock items, send an email alert
                if (lowStockItems.length > 0) {
                    // Create HTML content for the email
                    const lowStockItemsHTML = lowStockItems.map(item => {
                        const product = item.productId as any;
                        return `
                            <tr>
                                <td>${product.title}</td>
                                <td>${item.currentStock}</td>
                                <td>${item.reservedStock}</td>
                                <td>${item.availableStock}</td>
                                <td>${item.threshold}</td>
                                <td>${item.availableStock <= 0 ? 'Out of Stock' : 'Low Stock'}</td>
                            </tr>
                        `;
                    }).join('');

                    // Send email alert
                    await sendEmail({
                        name: "Inventory Alert",
                        subject: "Inventory Alert: Products Below Threshold",
                        sendTo: "admin@example.com", // Replace with actual admin email
                        from: "Inventory System <inventory@email.super-trader.xyz>",
                        html: `
                            <h1>Inventory Alert</h1>
                            <p>The following products have reached or fallen below their inventory threshold levels:</p>
                            <table border="1" cellpadding="5" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Current Stock</th>
                                        <th>Reserved Stock</th>
                                        <th>Available Stock</th>
                                        <th>Threshold</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${lowStockItemsHTML}
                                </tbody>
                            </table>
                            <p>Please take action to increase the production or inventory of these products.</p>
                        `
                    });
                    
                    console.log(`Inventory alert sent for ${lowStockItems.length} products`);
                }
            } catch (error) {
                console.error("Error in inventory alert middleware:", error);
                // Don't throw the error since this is a background process
            }
        }, 0);
        
        // Return the original response
        return result;
    };
    
    next();
};