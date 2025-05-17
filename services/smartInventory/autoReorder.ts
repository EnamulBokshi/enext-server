import mongoose from "mongoose";
import InventoryModel from "../../models/inventory.model.js";
import ProductModel from "../../models/product.model.js";
import sendEmail from "../sendEmail.service.js";
import { calculateReorderParameters } from "./demandForecaster.js";

/**
 * Smart Inventory Management - Auto-Reorder System
 * This service handles automatic reordering based on inventory levels, demand forecasts,
 * and optimal order quantities.
 */

interface ReorderRequest {
  productId: mongoose.Types.ObjectId;
  productName: string;
  currentStock: number;
  availableStock: number;
  reorderPoint: number;
  orderQuantity: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Check for products that need to be reordered based on reorder points
 * and auto-reorder settings
 */
export const checkReorderNeeds = async (): Promise<ReorderRequest[]> => {
  try {
    // Find products that have fallen below their reorder points
    const lowStockItems = await InventoryModel.find({
      autoReorderEnabled: true,
      $expr: {
        $lte: ["$availableStock", "$reorderPoint"]
      }
    }).populate({
      path: 'productId',
      select: 'title price discount images'
    });
    
    // Prepare reorder requests
    const reorderRequests: ReorderRequest[] = [];
    
    for (const item of lowStockItems) {
      // Skip items that have been reordered recently (within 3 days)
      if (item.lastReorderDate) {
        const daysSinceLastReorder = Math.floor(
          (Date.now() - new Date(item.lastReorderDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastReorder < 3) {
          continue;
        }
      }
      
      const product = item.productId as any;
      if (!product) continue;
      
      // Calculate priority based on stock level relative to reorder point
      let priority: 'high' | 'medium' | 'low' = 'medium';
      
      if (item.availableStock <= 0) {
        priority = 'high';
      } else if (item.availableStock <= item.reorderPoint * 0.5) {
        priority = 'high';
      } else if (item.availableStock <= item.reorderPoint * 0.75) {
        priority = 'medium';
      } else {
        priority = 'low';
      }
      
      reorderRequests.push({
        productId: product._id,
        productName: product.title,
        currentStock: item.currentStock,
        availableStock: item.availableStock,
        reorderPoint: item.reorderPoint,
        orderQuantity: item.optimalOrderQuantity,
        priority
      });
    }
    
    // Sort by priority (high to low)
    reorderRequests.sort((a, b) => {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      return priorityValues[b.priority] - priorityValues[a.priority];
    });
    
    return reorderRequests;
  } catch (error) {
    console.error("Error checking for reorder needs:", error);
    return [];
  }
};

/**
 * Process auto-reorders for items that have fallen below their reorder points
 */
export const processAutoReorders = async (): Promise<number> => {
  try {
    const reorderRequests = await checkReorderNeeds();
    
    if (reorderRequests.length === 0) {
      return 0;
    }
    
    // Process each reorder request
    const processingPromises = reorderRequests.map(async (request) => {
      try {
        // Update the inventory record to mark as reordered
        await InventoryModel.updateOne(
          { productId: request.productId },
          { 
            $set: { 
              lastReorderDate: new Date() 
            }
          }
        );
        
        // In a real system, this would integrate with a purchase order system
        // or supplier API. For now, we'll just simulate it with an email notification.
        return request;
      } catch (error) {
        console.error(`Error processing reorder for product ${request.productId}:`, error);
        return null;
      }
    });
    
    const processedRequests = (await Promise.all(processingPromises)).filter(Boolean);
    
    // Send a consolidated email with all the reorders
    if (processedRequests.length > 0) {
      await sendReorderNotification(processedRequests as ReorderRequest[]);
    }
    
    return processedRequests.length;
  } catch (error) {
    console.error("Error processing auto-reorders:", error);
    return 0;
  }
};

/**
 * Send email notification for auto-reordered products
 * @param reorderRequests - List of reorder requests to include in the notification
 */
export const sendReorderNotification = async (reorderRequests: ReorderRequest[]): Promise<void> => {
  try {
    // Group by priority for better readability
    const highPriority = reorderRequests.filter(req => req.priority === 'high');
    const mediumPriority = reorderRequests.filter(req => req.priority === 'medium');
    const lowPriority = reorderRequests.filter(req => req.priority === 'low');
    
    // Create the HTML content for the email
    const reorderTableHTML = (requests: ReorderRequest[], priorityLabel: string) => {
      if (requests.length === 0) return '';
      
      return `
        <h3>${priorityLabel} Priority Reorders</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Available Stock</th>
              <th>Reorder Point</th>
              <th>Order Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map(req => `
              <tr>
                <td>${req.productName}</td>
                <td>${req.currentStock}</td>
                <td>${req.availableStock}</td>
                <td>${req.reorderPoint}</td>
                <td>${req.orderQuantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    };
    
    const emailContent = `
      <h2>Automatic Reorder Notification</h2>
      <p>The system has automatically identified the following products that need to be reordered:</p>
      
      ${reorderTableHTML(highPriority, 'High')}
      ${reorderTableHTML(mediumPriority, 'Medium')}
      ${reorderTableHTML(lowPriority, 'Low')}
      
      <p>These reorders have been automatically triggered by the smart inventory management system based on 
      demand forecasts, current stock levels, and optimal order quantities.</p>
      
      <p><strong>Total products to reorder: ${reorderRequests.length}</strong></p>
    `;
    
    await sendEmail({
      name: 'Inventory System',
      sendTo: 'inventory@example.com', // Replace with actual admin email
      subject: `Smart Inventory: ${reorderRequests.length} Products Auto-Reordered`,
      html: emailContent,
      from: 'Smart Inventory System <inventory@email.super-trader.xyz>'
    });
    
  } catch (error) {
    console.error("Error sending reorder notification:", error);
  }
};

/**
 * Toggle auto-reorder setting for a product
 * @param productId - ID of the product
 * @param enabled - Whether auto-reordering should be enabled or disabled
 */
export const toggleAutoReorder = async (
  productId: string | mongoose.Types.ObjectId,
  enabled: boolean
): Promise<boolean> => {
  try {
    const inventory = await InventoryModel.findOne({ productId });
    if (!inventory) {
      throw new Error('Inventory record not found');
    }
    
    // If enabling auto-reorder, make sure we have valid reorder parameters
    if (enabled) {
      // Calculate reorder parameters if they're missing or invalid
      if (!inventory.reorderPoint || !inventory.optimalOrderQuantity) {
        await calculateReorderParameters(productId);
      }
    }
    
    // Update the auto-reorder setting
    await InventoryModel.updateOne(
      { productId },
      { $set: { autoReorderEnabled: enabled } }
    );
    
    return true;
  } catch (error) {
    console.error(`Error toggling auto-reorder for product ${productId}:`, error);
    return false;
  }
};

/**
 * Update reorder parameters manually
 * @param productId - ID of the product
 * @param reorderPoint - Manual reorder point
 * @param orderQuantity - Manual order quantity
 * @param leadTime - Lead time in days (optional)
 */
export const updateReorderParameters = async (
  productId: string | mongoose.Types.ObjectId,
  reorderPoint: number,
  orderQuantity: number,
  leadTime?: number
): Promise<boolean> => {
  try {
    const inventory = await InventoryModel.findOne({ productId });
    if (!inventory) {
      throw new Error('Inventory record not found');
    }
    
    const updates: any = {
      reorderPoint,
      optimalOrderQuantity: orderQuantity
    };
    
    if (leadTime !== undefined) {
      updates.leadTime = leadTime;
    }
    
    // Update the inventory with the new parameters
    await InventoryModel.updateOne(
      { productId },
      { $set: updates }
    );
    
    return true;
  } catch (error) {
    console.error(`Error updating reorder parameters for product ${productId}:`, error);
    return false;
  }
};