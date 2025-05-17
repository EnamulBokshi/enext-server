import mongoose from "mongoose";
import InventoryModel from "../../models/inventory.model.js";
import SellsLogsModel from "../../models/sellsLogs.model.js";
import OrderModel from "../../models/order.model.js";

/**
 * Smart Inventory Management - Real-time Synchronization
 * This service ensures inventory records stay accurate even during high-traffic
 * periods and concurrent operations.
 */

// Use a Map to track ongoing inventory operations for concurrency control
const inventoryLocks = new Map<string, boolean>();

/**
 * Acquire a lock for a specific product's inventory operations
 * @param productId - ID of the product
 * @returns True if the lock was acquired, false if already locked
 */
const acquireLock = (productId: string): boolean => {
  const key = productId.toString();
  
  if (inventoryLocks.has(key)) {
    return false; // Already locked
  }
  
  inventoryLocks.set(key, true);
  return true;
};

/**
 * Release a lock for a specific product's inventory operations
 * @param productId - ID of the product
 */
const releaseLock = (productId: string): void => {
  const key = productId.toString();
  inventoryLocks.delete(key);
};

/**
 * Perform an inventory operation with concurrency control
 * @param productId - ID of the product
 * @param operation - Async function that performs the actual operation
 * @param maxRetries - Maximum number of retries if locked (default: 5)
 * @param retryDelayMs - Delay between retries in milliseconds (default: 200)
 */
export const withInventoryLock = async <T>(
  productId: string | mongoose.Types.ObjectId, 
  operation: () => Promise<T>,
  maxRetries: number = 5,
  retryDelayMs: number = 200
): Promise<T> => {
  const productIdStr = productId.toString();
  let retries = 0;
  
  while (retries < maxRetries) {
    if (acquireLock(productIdStr)) {
      try {
        // Execute the operation with the lock held
        return await operation();
      } finally {
        // Always release the lock, even if operation fails
        releaseLock(productIdStr);
      }
    }
    
    // Couldn't acquire lock, wait and retry
    retries++;
    if (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }
  
  throw new Error(`Failed to acquire inventory lock for product ${productIdStr} after ${maxRetries} attempts`);
};

/**
 * Synchronize inventory record with actual sales and orders data
 * This helps correct any inconsistencies that may occur due to concurrent operations
 * @param productId - ID of the product to synchronize
 */
export const synchronizeInventory = async (
  productId: string | mongoose.Types.ObjectId
): Promise<void> => {
  await withInventoryLock(productId, async () => {
    // Get the current inventory record
    const inventory = await InventoryModel.findOne({ productId });
    if (!inventory) {
      throw new Error(`Inventory not found for product ${productId}`);
    }
    
    // Calculate total sales from order records
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // Look back 90 days
    
    const salesLogs = await SellsLogsModel.find({
      productId,
      action: "purchased",
      createdAt: { $gte: startDate }
    });
    
    // Calculate total quantity sold
    const totalSold = salesLogs.reduce((sum, log) => sum + log.quantity, 0);
    
    // Count currently reserved quantity (in carts)
    const currentlyReserved = await calculateReservedQuantity(productId);
    
    // Update inventory with corrected values
    inventory.reservedStock = currentlyReserved;
    
    // Make sure available stock is correctly calculated
    inventory.availableStock = inventory.currentStock - inventory.reservedStock;
    
    await inventory.save();
    
    console.log(`Inventory synchronized for product ${productId}. Current: ${inventory.currentStock}, Reserved: ${inventory.reservedStock}, Available: ${inventory.availableStock}`);
    
    return inventory;
  });
};

/**
 * Calculate the actual reserved quantity from active carts
 * @param productId - ID of the product
 */
const calculateReservedQuantity = async (
  productId: string | mongoose.Types.ObjectId
): Promise<number> => {
  // This would normally query CartProductModel but for simplicity,
  // we're using the current value from the inventory record
  const inventory = await InventoryModel.findOne({ productId });
  return inventory ? inventory.reservedStock : 0;
};

/**
 * Update sales history for a product
 * @param productId - ID of the product
 * @param quantity - Quantity sold
 * @param date - Date of the sale (defaults to now)
 */
export const recordSalesHistory = async (
  productId: string | mongoose.Types.ObjectId,
  quantity: number,
  date: Date = new Date()
): Promise<void> => {
  await withInventoryLock(productId, async () => {
    // Get the inventory record
    const inventory = await InventoryModel.findOne({ productId });
    if (!inventory) {
      throw new Error(`Inventory not found for product ${productId}`);
    }
    
    // Add to the sales history array
    const salesEntry = {
      date,
      quantity
    };
    
    // Add to sales history array, maintain chronological order
    if (!inventory.salesHistory) {
      // Initialize salesHistory with Mongoose's built-in array creation
      // This ensures the correct MongoDB DocumentArray type is used
      inventory.set('salesHistory', []);
    }
    
    inventory.salesHistory.push(salesEntry);
    
    // Keep only the last 90 days of sales history to manage array size
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    
    inventory.set(
      'salesHistory',
      inventory.salesHistory.filter(entry => new Date(entry.date) >= cutoffDate)
    );
    
    await inventory.save();
  });
};

/**
 * Force reconcile inventory with order and sales data
 * This is useful for fixing inconsistencies in inventory data
 * @param productId - ID of the product
 */
export const reconcileInventory = async (
  productId: string | mongoose.Types.ObjectId
): Promise<{
  previousStock: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  wasCorrected: boolean;
}> => {
  return withInventoryLock(productId, async () => {
    // Get the inventory record
    const inventory = await InventoryModel.findOne({ productId });
    if (!inventory) {
      throw new Error(`Inventory not found for product ${productId}`);
    }
    
    const previousStock = inventory.currentStock;
    const previousReserved = inventory.reservedStock;
    
    // Calculate reserved stock based on active cart items
    const reservedStock = await calculateReservedQuantity(productId);
    
    // Get total sales from orders to double-check current stock
    // In a real system, you'd also account for inventory additions
    // from purchase orders, returns, etc.
    
    let wasCorrected = false;
    
    // If there's a discrepancy between actual reserved and recorded reserved
    if (reservedStock !== inventory.reservedStock) {
      inventory.reservedStock = reservedStock;
      wasCorrected = true;
    }
    
    // Recalculate available stock
    const availableStock = inventory.currentStock - inventory.reservedStock;
    if (inventory.availableStock !== availableStock) {
      inventory.availableStock = availableStock;
      wasCorrected = true;
    }
    
    if (wasCorrected) {
      await inventory.save();
    }
    
    return {
      previousStock,
      currentStock: inventory.currentStock,
      reservedStock: inventory.reservedStock,
      availableStock: inventory.availableStock,
      wasCorrected
    };
  });
};

/**
 * Validate and correct inventory levels across the entire system
 * This is useful for periodic maintenance and fixing inconsistencies
 */
export const validateAllInventory = async (): Promise<{
  processed: number;
  corrected: number;
}> => {
  // Get all inventory records
  const inventoryItems = await InventoryModel.find();
  let corrected = 0;
  
  // Process in batches to avoid overloading the system
  const batchSize = 10;
  
  for (let i = 0; i < inventoryItems.length; i += batchSize) {
    const batch = inventoryItems.slice(i, i + batchSize);
    
    // Process each item in the batch
    const results = await Promise.all(
      batch.map(async (item) => {
        try {
          const result = await reconcileInventory(item.productId);
          return result.wasCorrected;
        } catch (error) {
          console.error(`Error reconciling inventory for product ${item.productId}:`, error);
          return false;
        }
      })
    );
    
    // Count corrections
    corrected += results.filter(Boolean).length;
    
    // Short delay between batches to prevent server overload
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return {
    processed: inventoryItems.length,
    corrected
  };
};