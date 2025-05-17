import mongoose from "mongoose";
import InventoryModel from "../../models/inventory.model.js";
import ProductModel from "../../models/product.model.js";
import sendEmail from "../sendEmail.service.js";
import { generateDemandForecast } from "./demandForecaster.js";

/**
 * Smart Inventory Management - Sellout Prevention System
 * This service identifies products at risk of selling out based on AI-driven demand forecasts
 * and sends proactive alerts to prevent stockouts.
 */

interface ProductAtRisk {
  productId: mongoose.Types.ObjectId;
  productName: string;
  availableStock: number;
  forecastedDemand: number;
  daysUntilStockout: number;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Check for products at risk of selling out based on forecasted demand
 * @param lookAheadDays - How many days ahead to look for potential stockouts
 */
export const checkStockoutRisks = async (
  lookAheadDays: number = 14
): Promise<ProductAtRisk[]> => {
  try {
    // First, ensure all forecasts are up to date
    const inventoryItems = await InventoryModel.find({
      currentStock: { $gt: 0 } // Only consider products with existing stock
    }).populate({
      path: 'productId',
      select: 'title category price images',
      populate: {
        path: 'category',
        select: 'name'
      }
    });
    
    // Create a list of products at risk
    const productsAtRisk: ProductAtRisk[] = [];
    
    for (const item of inventoryItems) {
      // Calculate days until stockout based on sales velocity
      const salesVelocity = item.salesVelocity || 0.1; // Ensure at least a minimal value
      
      // Skip items with no sales velocity
      if (salesVelocity <= 0) {
        continue;
      }
      
      const daysUntilStockout = Math.floor(item.availableStock / salesVelocity);
      
      // Skip items that will last longer than our lookAheadDays
      if (daysUntilStockout > lookAheadDays) {
        continue;
      }
      
      // Determine priority based on days until stockout
      let priority: 'critical' | 'high' | 'medium' | 'low';
      
      if (daysUntilStockout <= 2) {
        priority = 'critical';
      } else if (daysUntilStockout <= 5) {
        priority = 'high';
      } else if (daysUntilStockout <= 10) {
        priority = 'medium';
      } else {
        priority = 'low';
      }
      
      const product = item.productId as any;
      const categoryName = product.category ? 
        (Array.isArray(product.category) ? 
          product.category.map((c: any) => c.name).join(', ') : 
          (product.category as any).name) : 
        'Uncategorized';
      
      productsAtRisk.push({
        productId: product._id,
        productName: product.title,
        availableStock: item.availableStock,
        forecastedDemand: item.forecastedDemand || 0,
        daysUntilStockout,
        category: categoryName,
        priority
      });
    }
    
    // Sort by days until stockout (ascending)
    productsAtRisk.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
    
    return productsAtRisk;
  } catch (error) {
    console.error("Error checking stockout risks:", error);
    return [];
  }
};

/**
 * Generate a sellout risk report and alert administrators
 * @param lookAheadDays - How many days ahead to look for potential stockouts
 */
export const generateSelloutRiskReport = async (
  lookAheadDays: number = 14
): Promise<void> => {
  try {
    console.log(`[${new Date().toISOString()}] Generating sellout risk report...`);
    
    // Get products at risk
    const productsAtRisk = await checkStockoutRisks(lookAheadDays);
    
    if (productsAtRisk.length === 0) {
      console.log(`[${new Date().toISOString()}] No products at risk of selling out within ${lookAheadDays} days.`);
      return;
    }
    
    // Group by priority
    const criticalProducts = productsAtRisk.filter(p => p.priority === 'critical');
    const highPriorityProducts = productsAtRisk.filter(p => p.priority === 'high');
    const mediumPriorityProducts = productsAtRisk.filter(p => p.priority === 'medium');
    const lowPriorityProducts = productsAtRisk.filter(p => p.priority === 'low');
    
    // Create HTML content for email
    const riskTableHTML = (products: ProductAtRisk[], priorityLabel: string, badgeColor: string) => {
      if (products.length === 0) return '';
      
      return `
        <h3 style="margin-top: 20px;">${priorityLabel} Risk Products <span style="background-color: ${badgeColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${products.length}</span></h3>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead style="background-color: #f3f4f6;">
            <tr>
              <th style="text-align: left;">Product</th>
              <th style="text-align: center;">Category</th>
              <th style="text-align: center;">Available Stock</th>
              <th style="text-align: center;">Forecasted Demand</th>
              <th style="text-align: center;">Days Until Stockout</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td style="text-align: left;">${p.productName}</td>
                <td style="text-align: center;">${p.category}</td>
                <td style="text-align: center;">${p.availableStock}</td>
                <td style="text-align: center;">${p.forecastedDemand}</td>
                <td style="text-align: center; ${p.priority === 'critical' ? 'color: red; font-weight: bold;' : ''}">${p.daysUntilStockout}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    };
    
    const emailContent = `
      <h2>Sellout Risk Report - ${new Date().toLocaleDateString()}</h2>
      <p>The smart inventory system has identified ${productsAtRisk.length} products at risk of selling out within ${lookAheadDays} days.</p>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
        <h3 style="margin-top: 0;">Summary</h3>
        <ul>
          <li><strong>Critical Risk (0-2 days):</strong> ${criticalProducts.length} products</li>
          <li><strong>High Risk (3-5 days):</strong> ${highPriorityProducts.length} products</li>
          <li><strong>Medium Risk (6-10 days):</strong> ${mediumPriorityProducts.length} products</li>
          <li><strong>Low Risk (11-${lookAheadDays} days):</strong> ${lowPriorityProducts.length} products</li>
        </ul>
      </div>
      
      ${riskTableHTML(criticalProducts, 'Critical', '#dc2626')}
      ${riskTableHTML(highPriorityProducts, 'High', '#ea580c')}
      ${riskTableHTML(mediumPriorityProducts, 'Medium', '#ca8a04')}
      ${riskTableHTML(lowPriorityProducts, 'Low', '#65a30d')}
      
      <p style="margin-top: 20px;">This report was automatically generated by the Smart Inventory Management System.</p>
      <p>You can review detailed inventory forecasts and manage reorder settings in the admin dashboard.</p>
    `;
    
    // Send the email alert
    await sendEmail({
      name: 'Smart Inventory System',
      subject: `Sellout Risk Alert: ${criticalProducts.length} Critical + ${highPriorityProducts.length} High Risk Products`,
      sendTo: 'inventory@example.com', // Replace with actual admin email
      html: emailContent,
      from: 'Smart Inventory System <inventory@email.super-trader.xyz>'
    });
    
    console.log(`[${new Date().toISOString()}] Sellout risk report sent with ${productsAtRisk.length} at-risk products.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generating sellout risk report:`, error);
  }
};

/**
 * Schedule a daily sellout risk check and alert
 */
export const scheduleSelloutPrevention = (intervalHours: number = 24): NodeJS.Timeout => {
  console.log(`Scheduling sellout prevention checks every ${intervalHours} hours`);
  
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  return setInterval(async () => {
    await generateSelloutRiskReport();
  }, intervalMs);
};