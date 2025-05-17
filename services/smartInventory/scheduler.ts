import mongoose from "mongoose";
import InventoryModel from "../../models/inventory.model.js";
import ProductModel from "../../models/product.model.js";
import { generateDemandForecast, calculateSalesVelocity, calculateReorderParameters } from "./demandForecaster.js";
import { processAutoReorders } from "./autoReorder.js";
import { validateAllInventory } from "./inventorySync.js";
import { scheduleSelloutPrevention, generateSelloutRiskReport } from "./selloutPrevention.js";

/**
 * Smart Inventory Management - Scheduler
 * This service manages periodic tasks for the smart inventory system,
 * including demand forecasting, sales analytics, and auto-reordering.
 */

// Track timers to avoid duplicates and allow cleanup
const scheduledJobs: { [key: string]: NodeJS.Timeout } = {};

/**
 * Schedule demand forecasting to run periodically for all products
 * @param intervalHours - Interval between forecasting runs in hours (default: 24)
 */
export const scheduleDemandForecasting = (intervalHours: number = 24): void => {
  const jobName = 'demandForecasting';
  
  // Clear existing job if any
  if (scheduledJobs[jobName]) {
    clearInterval(scheduledJobs[jobName]);
  }
  
  // Convert hours to milliseconds
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  // Schedule the job
  scheduledJobs[jobName] = setInterval(async () => {
    try {
      console.log(`[${new Date().toISOString()}] Running scheduled demand forecasting...`);
      
      // Get all products with inventory
      const inventoryItems = await InventoryModel.find();
      
      // Process in batches to avoid overloading the system
      const batchSize = 10;
      for (let i = 0; i < inventoryItems.length; i += batchSize) {
        const batch = inventoryItems.slice(i, i + batchSize);
        
        // Process each item in the batch
        const promises = batch.map(async (item) => {
          try {
            // Update sales velocity
            await calculateSalesVelocity(item.productId);
            
            // Generate new demand forecast
            await generateDemandForecast(item.productId);
            
            // Update reorder parameters
            await calculateReorderParameters(item.productId);
          } catch (error) {
            console.error(`Error processing forecast for product ${item.productId}:`, error);
          }
        });
        
        // Wait for batch to complete before moving to next batch
        await Promise.all(promises);
        
        // Short delay between batches to prevent server overload
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`[${new Date().toISOString()}] Scheduled demand forecasting completed.`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in scheduled demand forecasting:`, error);
    }
  }, intervalMs);
  
  console.log(`Demand forecasting scheduled to run every ${intervalHours} hours`);
};

/**
 * Schedule auto-reorder checks to run periodically
 * @param intervalHours - Interval between auto-reorder checks in hours (default: 6)
 */
export const scheduleAutoReorders = (intervalHours: number = 6): void => {
  const jobName = 'autoReorders';
  
  // Clear existing job if any
  if (scheduledJobs[jobName]) {
    clearInterval(scheduledJobs[jobName]);
  }
  
  // Convert hours to milliseconds
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  // Schedule the job
  scheduledJobs[jobName] = setInterval(async () => {
    try {
      console.log(`[${new Date().toISOString()}] Running scheduled auto-reorder check...`);
      
      const processedCount = await processAutoReorders();
      
      console.log(`[${new Date().toISOString()}] Auto-reorder check completed. Processed ${processedCount} reorders.`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in scheduled auto-reorder check:`, error);
    }
  }, intervalMs);
  
  console.log(`Auto-reorder checks scheduled to run every ${intervalHours} hours`);
};

/**
 * Schedule a nightly historical data cleanup and aggregation job
 * This helps maintain database performance by summarizing older historical data
 */
export const scheduleDataMaintenance = (): void => {
  const jobName = 'dataMaintenance';
  
  // Clear existing job if any
  if (scheduledJobs[jobName]) {
    clearInterval(scheduledJobs[jobName]);
  }
  
  // Calculate time until next run (1:00 AM)
  const now = new Date();
  const nextRun = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getHours() >= 1 ? now.getDate() + 1 : now.getDate(),
    1, 0, 0
  );
  
  const msUntilNextRun = nextRun.getTime() - now.getTime();
  
  // Schedule initial run
  const initialTimer = setTimeout(() => {
    // Run maintenance task
    runDataMaintenance();
    
    // Then schedule recurring daily runs
    scheduledJobs[jobName] = setInterval(runDataMaintenance, 24 * 60 * 60 * 1000);
  }, msUntilNextRun);
  
  scheduledJobs[`${jobName}_initial`] = initialTimer;
  
  console.log(`Data maintenance scheduled to run daily at 1:00 AM. Next run in ${Math.round(msUntilNextRun / 3600000)} hours.`);
};

/**
 * Schedule daily inventory reconciliation to correct discrepancies
 */
export const scheduleInventoryReconciliation = (): void => {
  const jobName = 'inventoryReconciliation';
  
  // Clear existing job if any
  if (scheduledJobs[jobName]) {
    clearInterval(scheduledJobs[jobName]);
  }
  
  // Calculate time until next run (3:00 AM - usually a low-traffic time)
  const now = new Date();
  const nextRun = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getHours() >= 3 ? now.getDate() + 1 : now.getDate(),
    3, 0, 0
  );
  
  const msUntilNextRun = nextRun.getTime() - now.getTime();
  
  // Schedule initial run
  const initialTimer = setTimeout(async () => {
    // Run reconciliation
    try {
      console.log(`[${new Date().toISOString()}] Running scheduled inventory reconciliation...`);
      
      const result = await validateAllInventory();
      
      console.log(`[${new Date().toISOString()}] Inventory reconciliation completed. Processed ${result.processed} items, corrected ${result.corrected} discrepancies.`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in scheduled inventory reconciliation:`, error);
    }
    
    // Then schedule recurring daily runs
    scheduledJobs[jobName] = setInterval(async () => {
      try {
        console.log(`[${new Date().toISOString()}] Running scheduled inventory reconciliation...`);
        
        const result = await validateAllInventory();
        
        console.log(`[${new Date().toISOString()}] Inventory reconciliation completed. Processed ${result.processed} items, corrected ${result.corrected} discrepancies.`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in scheduled inventory reconciliation:`, error);
      }
    }, 24 * 60 * 60 * 1000);
  }, msUntilNextRun);
  
  scheduledJobs[`${jobName}_initial`] = initialTimer;
  
  console.log(`Inventory reconciliation scheduled to run daily at 3:00 AM. Next run in ${Math.round(msUntilNextRun / 3600000)} hours.`);
};

/**
 * Schedule sellout prevention reports
 */
export const scheduleSelloutReports = (): void => {
  const jobName = 'selloutPrevention';
  
  // Clear existing job if any
  if (scheduledJobs[jobName]) {
    clearInterval(scheduledJobs[jobName]);
  }
  
  // Calculate time until next run (9:00 AM - morning report for business day)
  const now = new Date();
  const nextRun = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getHours() >= 9 ? now.getDate() + 1 : now.getDate(),
    9, 0, 0
  );
  
  const msUntilNextRun = nextRun.getTime() - now.getTime();
  
  // Schedule initial run
  const initialTimer = setTimeout(async () => {
    // Run sellout risk report
    try {
      console.log(`[${new Date().toISOString()}] Generating scheduled sellout risk report...`);
      await generateSelloutRiskReport();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error generating sellout risk report:`, error);
    }
    
    // Then schedule recurring daily runs
    scheduledJobs[jobName] = setInterval(async () => {
      try {
        console.log(`[${new Date().toISOString()}] Generating scheduled sellout risk report...`);
        await generateSelloutRiskReport();
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error generating sellout risk report:`, error);
      }
    }, 24 * 60 * 60 * 1000);
  }, msUntilNextRun);
  
  scheduledJobs[`${jobName}_initial`] = initialTimer;
  
  console.log(`Sellout risk reports scheduled to run daily at 9:00 AM. Next run in ${Math.round(msUntilNextRun / 3600000)} hours.`);
};

/**
 * Run inventory data maintenance tasks
 */
const runDataMaintenance = async (): Promise<void> => {
  try {
    console.log(`[${new Date().toISOString()}] Running inventory data maintenance...`);
    
    // Here we would implement tasks like:
    // - Consolidating old sales history
    // - Cleaning up expired salesHistory entries
    // - Aggregating historical data
    // - Optimizing database indexes
    // - Generating analytics reports
    
    // For now, we'll just log that it was executed
    console.log(`[${new Date().toISOString()}] Inventory data maintenance completed.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in inventory data maintenance:`, error);
  }
};

/**
 * Initialize all smart inventory background jobs
 */
export const initializeScheduledJobs = (): void => {
  // Schedule demand forecasting every 24 hours
  scheduleDemandForecasting(24);
  
  // Schedule auto-reorder checks every 6 hours
  scheduleAutoReorders(6);
  
  // Schedule data maintenance to run daily
  scheduleDataMaintenance();
  
  // Schedule inventory reconciliation to run daily
  scheduleInventoryReconciliation();
  
  // Schedule sellout prevention reports daily
  scheduleSelloutReports();
  
  console.log('All smart inventory scheduled jobs initialized.');
};

/**
 * Clean up all scheduled jobs
 */
export const stopScheduledJobs = (): void => {
  for (const jobName in scheduledJobs) {
    clearInterval(scheduledJobs[jobName]);
    console.log(`Stopped scheduled job: ${jobName}`);
  }
};