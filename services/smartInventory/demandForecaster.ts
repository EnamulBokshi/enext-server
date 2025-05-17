import googleGenAI from "../../config/gemini.js";
import InventoryModel from "../../models/inventory.model.js";
import ProductModel from "../../models/product.model.js";
import SellsLogsModel from "../../models/sellsLogs.model.js";
import ProductPerformanceModel from "../../models/productPerformance.model.js";
import mongoose from "mongoose";

/**
 * Smart Inventory Management - Demand Forecasting System
 * This service uses historical sales data, seasonality patterns, and product performance
 * metrics to generate accurate demand forecasts and optimize inventory levels.
 */

interface SalesTrend {
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number; // percentage change rate
  confidence: number; // confidence score from 0-1
}

/**
 * Calculate sales velocity (rate of sales) based on historical data
 * @param productId - ID of the product to analyze
 * @param days - Number of days of historical data to consider
 */
export const calculateSalesVelocity = async (
  productId: string | mongoose.Types.ObjectId,
  days: number = 30
): Promise<number> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get sales history from the SellsLogs model
    const sellsLogs = await SellsLogsModel.find({
      productId,
      action: "purchased",
      createdAt: { $gte: startDate }
    });
    
    // Calculate total units sold
    const totalSold = sellsLogs.reduce((sum, log) => sum + log.quantity, 0);
    
    // Calculate daily sales velocity
    const salesVelocity = totalSold / days;
    
    // Update the inventory model with the calculated sales velocity
    await InventoryModel.updateOne(
      { productId },
      { $set: { salesVelocity } }
    );
    
    return salesVelocity;
  } catch (error) {
    console.error(`Error calculating sales velocity for product ${productId}:`, error);
    return 0;
  }
};

/**
 * Analyze seasonality patterns for a product based on historical sales
 * @param productId - ID of the product to analyze
 */
export const analyzeSeasonality = async (
  productId: string | mongoose.Types.ObjectId
): Promise<Map<string, number>> => {
  try {
    const performanceData = await ProductPerformanceModel.findOne({ productId });
    if (!performanceData || !performanceData.dailyMetrics.length) {
      return new Map();
    }
    
    // Group sales by month to identify seasonal patterns
    const monthlySales = new Map<string, number>();
    
    performanceData.dailyMetrics.forEach(metric => {
      const date = new Date(metric.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      const currentValue = monthlySales.get(monthKey) || 0;
      monthlySales.set(monthKey, currentValue + (metric.totalSold || 0));
    });
    
    // Calculate average sales for each month of the year
    const monthlyAverages = new Map<string, number>();
    const monthCounts = new Map<string, number>();
    
    for (const [key, value] of monthlySales.entries()) {
      const month = parseInt(key.split('-')[1]);
      const monthName = month.toString();
      
      const currentTotal = monthlyAverages.get(monthName) || 0;
      const currentCount = monthCounts.get(monthName) || 0;
      
      monthlyAverages.set(monthName, currentTotal + value);
      monthCounts.set(monthName, currentCount + 1);
    }
    
    // Calculate final averages and normalize
    const seasonality = new Map<string, number>();
    let totalAverage = 0;
    
    // Calculate each month's average first
    for (let i = 1; i <= 12; i++) {
      const month = i.toString();
      const total = monthlyAverages.get(month) || 0;
      const count = monthCounts.get(month) || 0;
      
      const monthlyAverage = count > 0 ? total / count : 0;
      seasonality.set(month, monthlyAverage);
      totalAverage += monthlyAverage;
    }
    
    // Normalize by dividing by the average
    const annualAverage = totalAverage / 12;
    if (annualAverage > 0) {
      for (let i = 1; i <= 12; i++) {
        const month = i.toString();
        const factor = seasonality.get(month)! / annualAverage;
        seasonality.set(month, parseFloat(factor.toFixed(2)));
      }
    }
    
    // Update the inventory record with seasonality data
    await InventoryModel.updateOne(
      { productId },
      { $set: { seasonality: Object.fromEntries(seasonality) } }
    );
    
    return seasonality;
  } catch (error) {
    console.error(`Error analyzing seasonality for product ${productId}:`, error);
    return new Map();
  }
};

/**
 * Analyze trends in product sales and performance
 * @param productId - ID of the product to analyze
 * @param days - Number of days to analyze
 */
export const analyzeSalesTrend = async (
  productId: string | mongoose.Types.ObjectId,
  days: number = 60
): Promise<SalesTrend> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const performanceData = await ProductPerformanceModel.findOne({ productId });
    if (!performanceData) {
      return { trend: 'stable', changeRate: 0, confidence: 0 };
    }
    
    // Get relevant metrics within the time period
    const relevantMetrics = performanceData.dailyMetrics.filter(
      metric => new Date(metric.date) >= startDate
    );
    
    if (relevantMetrics.length < 2) {
      return { trend: 'stable', changeRate: 0, confidence: 0 };
    }
    
    // Sort metrics by date
    relevantMetrics.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Split into two periods to compare
    const midPoint = Math.floor(relevantMetrics.length / 2);
    const firstPeriod = relevantMetrics.slice(0, midPoint);
    const secondPeriod = relevantMetrics.slice(midPoint);
    
    // Calculate average sales for each period
    const firstPeriodSales = firstPeriod.reduce((sum, metric) => sum + (metric.totalSold || 0), 0);
    const secondPeriodSales = secondPeriod.reduce((sum, metric) => sum + (metric.totalSold || 0), 0);
    
    const firstPeriodAvg = firstPeriodSales / firstPeriod.length;
    const secondPeriodAvg = secondPeriodSales / secondPeriod.length;
    
    // Calculate change rate
    let changeRate = 0;
    if (firstPeriodAvg > 0) {
      changeRate = ((secondPeriodAvg - firstPeriodAvg) / firstPeriodAvg) * 100;
    }
    
    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable';
    
    if (changeRate > 5) {
      trend = 'increasing';
    } else if (changeRate < -5) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }
    
    // Calculate confidence score based on data variance and sample size
    const totalDataPoints = relevantMetrics.length;
    const dataSizeConfidence = Math.min(1, totalDataPoints / 30);
    
    // Higher confidence for more consistent data
    const dailyValues = relevantMetrics.map(metric => metric.totalSold || 0);
    const mean = dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length;
    const variance = dailyValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyValues.length;
    
    const varianceConfidence = Math.max(0, 1 - Math.min(1, variance / (mean * 3 || 1)));
    
    const confidence = (dataSizeConfidence * 0.4 + varianceConfidence * 0.6);
    
    return { 
      trend, 
      changeRate: parseFloat(changeRate.toFixed(2)), 
      confidence: parseFloat(confidence.toFixed(2)) 
    };
  } catch (error) {
    console.error(`Error analyzing sales trends for product ${productId}:`, error);
    return { trend: 'stable', changeRate: 0, confidence: 0 };
  }
};

/**
 * Generate demand forecast for a product using historical data and AI analysis
 * @param productId - ID of the product to forecast
 * @param forecastDays - Number of days ahead to forecast
 */
export const generateDemandForecast = async (
  productId: string | mongoose.Types.ObjectId,
  forecastDays: number = 30
): Promise<number> => {
  try {
    // Get product information
    const product = await ProductModel.findById(productId).populate('category');
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Get inventory record
    const inventory = await InventoryModel.findOne({ productId });
    if (!inventory) {
      throw new Error('Inventory record not found');
    }
    
    // 1. Calculate current sales velocity
    const salesVelocity = await calculateSalesVelocity(productId);
    
    // 2. Analyze seasonality
    const seasonality = await analyzeSeasonality(productId);
    
    // 3. Get sales trend
    const salesTrend = await analyzeSalesTrend(productId);
    
    // 4. Get the current month for seasonality factor
    const currentMonth = (new Date().getMonth() + 1).toString();
    const seasonalFactor = seasonality.get(currentMonth) || 1.0;
    
    // Apply trend factor based on confidence
    const trendFactor = 1 + (salesTrend.changeRate / 100 * salesTrend.confidence);
    
    // Calculate base forecast using all factors
    const baseForecast = salesVelocity * trendFactor * seasonalFactor * forecastDays;
    
    // Round to nearest whole number
    const forecastedDemand = Math.round(Math.max(0, baseForecast));
    
    // Update the inventory with forecasted demand
    await InventoryModel.updateOne(
      { productId },
      { $set: { forecastedDemand } }
    );
    
    // For products with very little or no historical data, attempt AI-assisted forecast
    if (salesVelocity === 0 || salesTrend.confidence < 0.3) {
      await aiAssistedForecast(productId, forecastDays);
    }
    
    return forecastedDemand;
  } catch (error) {
    console.error(`Error generating demand forecast for product ${productId}:`, error);
    return 0;
  }
};

/**
 * Use AI to assist with demand forecasting when there's limited historical data
 * @param productId - ID of the product to forecast
 * @param forecastDays - Number of days ahead to forecast
 */
export const aiAssistedForecast = async (
  productId: string | mongoose.Types.ObjectId,
  forecastDays: number
): Promise<void> => {
  try {
    // Get product and category information
    const product = await ProductModel.findById(productId)
      .populate('category')
      .populate('sub_category');
    
    if (!product) {
      return;
    }
    
    // Get inventory information
    const inventory = await InventoryModel.findOne({ productId });
    if (!inventory) {
      return;
    }
    
    // Get similar products based on category for comparative analysis
    const similarProducts = await ProductModel.find({
      _id: { $ne: product._id },
      category: { $in: product.category }
    }).limit(5);
    
    // Extract similar products' sales data
    const similarProductsData = await Promise.all(
      similarProducts.map(async (p) => {
        const inv = await InventoryModel.findOne({ productId: p._id });
        const perf = await ProductPerformanceModel.findOne({ productId: p._id });
        
        return {
          title: p.title,
          price: p.price,
          discount: p.discount,
          salesVelocity: inv?.salesVelocity || 0,
          totalSold: perf?.totalSold || 0
        };
      })
    );
    
    // Prepare context for AI
    const categoryNames = Array.isArray(product.category) 
      ? product.category.map((c: any) => c.name).join(', ')
      : (product.category as any)?.name || 'Unknown';
      
    const subcategoryNames = Array.isArray(product.sub_category)
      ? product.sub_category.map((sc: any) => sc.name).join(', ') 
      : (product.sub_category as any)?.name || 'Unknown';

    const aiPrompt = `
      As an AI inventory management assistant, help predict the demand for the next ${forecastDays} days for this product:
      
      Product: ${product.title}
      Category: ${categoryNames}
      Subcategory: ${subcategoryNames}
      Price: $${product.price} (${product.discount}% discount if applicable)
      Current Stock: ${inventory.currentStock}
      
      This product has limited historical sales data.
      
      Similar products in the same category have the following metrics:
      ${similarProductsData.map(p => 
        `- ${p.title}: Price $${p.price}, Sales velocity: ${p.salesVelocity} units/day, Total sold: ${p.totalSold}`
      ).join('\n')}
      
      Based on this information, predict a reasonable daily sales velocity and total demand for the next ${forecastDays} days.
      Provide just the numeric forecast value as your answer, with no additional text.
    `;

    // Call AI for prediction
    const result = await googleGenAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: aiPrompt }]}],
    //   config: {
    //     maxOutputTokens: 60,
    //     temperature: 0.2
    //   }
    });

    if (!result.candidates || !result.candidates.length) {
      throw new Error('No forecast generated by AI');
    }
    
    // Parse the AI response to extract the forecast number
    const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    const forecastMatch = aiResponse.match(/\d+(\.\d+)?/);
    
    if (forecastMatch && forecastMatch[0]) {
      const aiForecast = Math.round(parseFloat(forecastMatch[0]));
      
      // Update inventory with AI forecast, but give it less weight than data-driven forecast
      await InventoryModel.updateOne(
        { productId },
        { 
          $set: { 
            forecastedDemand: aiForecast > 0 ? aiForecast : inventory.forecastedDemand || 0 
          } 
        }
      );
    }
  } catch (error) {
    console.error(`Error in AI-assisted forecast for product ${productId}:`, error);
  }
};

/**
 * Calculate optimal reorder point and quantity using EOQ (Economic Order Quantity) model
 * @param productId - ID of the product
 */
export const calculateReorderParameters = async (
  productId: string | mongoose.Types.ObjectId
): Promise<{ reorderPoint: number, optimalOrderQuantity: number }> => {
  try {
    const inventory = await InventoryModel.findOne({ productId });
    if (!inventory) {
      throw new Error('Inventory not found');
    }
    
    // Get product information for cost calculations
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Calculate safety stock based on lead time and forecasted demand
    const dailyDemand = inventory.salesVelocity || 0.1; // Use at least 0.1 to avoid division by 0
    const leadTime = inventory.leadTime || 7; // Default lead time is 7 days
    
    // Safety stock = Z-score * Standard deviation of demand during lead time
    // Using Z-score of 1.65 for 95% service level
    const safetyFactor = 1.65;
    // Simplified calculation for standard deviation - assuming 30% of mean
    const stdDevDemand = dailyDemand * 0.3;
    const safetyStock = Math.ceil(safetyFactor * stdDevDemand * Math.sqrt(leadTime));
    
    // Reorder point = Expected demand during lead time + Safety stock
    const reorderPoint = Math.ceil(dailyDemand * leadTime + safetyStock);
    
    // Calculate Economic Order Quantity
    // EOQ = sqrt(2 * Annual Demand * Ordering Cost / Holding Cost)
    // Using simplified assumptions:
    // - Annual demand = Daily demand * 365
    // - Ordering cost = 5% of product price
    // - Holding cost = 20% of product price per year
    const annualDemand = dailyDemand * 365;
    const orderingCost = product.price * 0.05;
    const holdingCost = product.price * 0.2;
    
    let optimalOrderQuantity = Math.ceil(
      Math.sqrt((2 * annualDemand * orderingCost) / holdingCost)
    );
    
    // Ensure the order quantity is reasonable
    const minOrder = Math.ceil(dailyDemand * 7); // At least 7 days of demand
    optimalOrderQuantity = Math.max(optimalOrderQuantity, minOrder);
    
    // Update inventory with calculated values
    await InventoryModel.updateOne(
      { productId },
      { 
        $set: {
          reorderPoint,
          optimalOrderQuantity
        }
      }
    );
    
    return { reorderPoint, optimalOrderQuantity };
  } catch (error) {
    console.error(`Error calculating reorder parameters for product ${productId}:`, error);
    return { reorderPoint: 5, optimalOrderQuantity: 10 };
  }
};