import { Response, Request } from "express";
import { vendorAssist } from "../services/vendorsAsistance.js";
import InventoryModel from "../models/inventory.model.js";
import ProductModel from "../models/product.model.js";
import { generateDemandForecast } from "../services/smartInventory/demandForecaster.js";
import { toggleAutoReorder, updateReorderParameters, processAutoReorders, checkReorderNeeds } from "../services/smartInventory/autoReorder.js";
import { calculateReorderParameters, calculateSalesVelocity, analyzeSeasonality, analyzeSalesTrend } from "../services/smartInventory/demandForecaster.js";

/**
 * Get AI-powered assistant response for inventory-related queries
 */
export const getInventoryAssist = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    
    // Validate question is provided
    if (!question) {
      return res.status(400).json({ 
        success: false, 
        error: true, 
        message: "Question parameter is required" 
      });
    }
    
    // Get AI response with inventory context
    const response = await vendorAssist(question);
    
    return res.status(200).json({
      success: true,
      error: false,
      message: "Inventory assistant response",
      data: {
        answer: response?.text || "Sorry, I couldn't generate a response."
      }
    });
  } catch (error) {
    console.error("Error in getInventoryAssist:", error);
    return res.status(500).json({ 
      success: false, 
      error: true, 
      message: "Failed to get inventory assistance"
    });
  }
};

/**
 * Get inventory overview with stock status summary
 */
export const getInventoryOverview = async (req: Request, res: Response) => {
  try {
    // Get counts of different inventory statuses
    const totalProducts = await InventoryModel.countDocuments();
    const outOfStock = await InventoryModel.countDocuments({ availableStock: { $lte: 0 } });
    const lowStock = await InventoryModel.countDocuments({ 
      $and: [
        { availableStock: { $gt: 0 } },
        { $expr: { $lte: ["$availableStock", "$threshold"] } }
      ]
    });
    const inStock = totalProducts - outOfStock - lowStock;
    
    // Get top 5 lowest stock items
    const criticalItems = await InventoryModel.find()
      .populate({
        path: 'productId',
        select: 'title price discount images'
      })
      .sort({ availableStock: 1 })
      .limit(5);
    
    return res.status(200).json({
      success: true,
      error: false,
      message: "Inventory overview",
      data: {
        summary: {
          totalProducts,
          outOfStock,
          lowStock,
          inStock,
          stockPercentage: totalProducts > 0 ? ((inStock / totalProducts) * 100).toFixed(2) : "0.00"
        },
        criticalItems: criticalItems.map(item => ({
          id: item._id,
          productId: item.productId._id,
          productName: (item.productId as any).title,
          currentStock: item.currentStock,
          availableStock: item.availableStock,
          reservedStock: item.reservedStock,
          threshold: item.threshold,
          status: item.availableStock <= 0 ? 'Out of Stock' : 
                 item.availableStock <= (item?.threshold ?? 0) ? 'Low Stock' : 'In Stock'
        }))
      }
    });
  } catch (error) {
    console.error("Error in getInventoryOverview:", error);
    return res.status(500).json({ 
      success: false, 
      error: true, 
      message: "Failed to get inventory overview"
    });
  }
};

/**
 * Get inventory status distribution by category
 */
export const getInventoryByCategory = async (req: Request, res: Response) => {
  try {
    // Get all products with their categories and inventory status
    const products = await ProductModel.find()
      .select('_id title category')
      .populate('category', 'name');
    
    // Get inventory data
    const inventoryData = await InventoryModel.find();
    
    // Create a map of product IDs to inventory status
    const inventoryStatusMap = new Map();
    inventoryData.forEach(item => {
      let status = 'In Stock';
      if (item.availableStock <= 0) {
        status = 'Out of Stock';
      } else if (item.availableStock <= (item.threshold ?? 0)) {
        status = 'Low Stock';
      }
      inventoryStatusMap.set(item.productId.toString(), {
        status,
        availableStock: item.availableStock,
        currentStock: item.currentStock
      });
    });
    
    // Organize by category
    const categoriesMap = new Map();
    products.forEach(product => {
      const categoryName = product.category ? (product.category as any).name : 'Uncategorized';
      const categoryId = product.category ? (product.category as any)._id : 'none';
      
      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          totalProducts: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          stockPercentage: 0
        });
      }
      
      const category = categoriesMap.get(categoryId);
      category.totalProducts++;
      
      const inventory = inventoryStatusMap.get(product._id.toString());
      if (inventory) {
        if (inventory.status === 'In Stock') {
          category.inStock++;
        } else if (inventory.status === 'Low Stock') {
          category.lowStock++;
        } else if (inventory.status === 'Out of Stock') {
          category.outOfStock++;
        }
      } else {
        category.outOfStock++;
      }
      
      // Recalculate stock percentage
      category.stockPercentage = category.totalProducts > 0 ? 
        ((category.inStock / category.totalProducts) * 100).toFixed(2) : "0.00";
    });
    
    return res.status(200).json({
      success: true,
      error: false,
      message: "Inventory by category",
      data: Array.from(categoriesMap.values())
    });
  } catch (error) {
    console.error("Error in getInventoryByCategory:", error);
    return res.status(500).json({ 
      success: false, 
      error: true, 
      message: "Failed to get inventory by category"
    });
  }
};

/**
 * Search inventory with various filters
 */
export const searchInventory = async (req: Request, res: Response) => {
  try {
    const { 
      query, 
      status, 
      categoryId,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    // Add stock status filter if provided
    if (status === 'out-of-stock') {
      filter.availableStock = { $lte: 0 };
    } else if (status === 'low-stock') {
      filter.$and = [
        { availableStock: { $gt: 0 } },
        { $expr: { $lte: ["$availableStock", "$threshold"] } }
      ];
    } else if (status === 'in-stock') {
      filter.$and = [
        { availableStock: { $gt: 0 } },
        { $expr: { $gt: ["$availableStock", "$threshold"] } }
      ];
    }
    
    // Get total count for pagination
    const totalItems = await InventoryModel.countDocuments(filter);
    
    // Get paginated results
    const items = await InventoryModel.find(filter)
      .populate({
        path: 'productId',
        select: 'title price discount images category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ availableStock: 1 });
    
    // Filter by category if provided
    let filteredItems = items;
    if (categoryId) {
      filteredItems = items.filter(item => {
        const product = item.productId as any;
        return product.category && product.category._id.toString() === categoryId;
      });
    }
    
    // Filter by search query if provided
    if (query) {
      const searchQuery = query.toString().toLowerCase();
      filteredItems = filteredItems.filter(item => {
        const product = item.productId as any;
        return product.title.toLowerCase().includes(searchQuery);
      });
    }
    
    // Format response
    const formattedItems = filteredItems.map(item => {
      const product = item.productId as any;
      return {
        id: item._id,
        productId: product._id,
        title: product.title,
        category: product.category ? product.category.name : 'Uncategorized',
        price: product.price,
        discount: product.discount,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        currentStock: item.currentStock,
        availableStock: item.availableStock,
        reservedStock: item.reservedStock,
        threshold: item.threshold,
        status: item.availableStock <= 0 ? 'Out of Stock' : 
               item.availableStock <= (item.threshold ?? 0) ? 'Low Stock' : 'In Stock'
      };
    });
    
    return res.status(200).json({
      success: true,
      error: false,
      message: "Inventory search results",
      data: formattedItems,
      pagination: {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / Number(limit)),
        currentPage: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error("Error in searchInventory:", error);
    return res.status(500).json({ 
      success: false, 
      error: true, 
      message: "Failed to search inventory"
    });
  }
};

/**
 * Get AI-generated demand forecast for a product
 */
export const getProductForecast = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Product ID is required"
      });
    }
    
    const forecastDays = Number(days);
    if (isNaN(forecastDays) || forecastDays <= 0 || forecastDays > 365) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Days parameter must be a number between 1 and 365"
      });
    }
    
    // Get existing inventory data
    const inventory = await InventoryModel.findOne({ productId }).populate({
      path: 'productId',
      select: 'title price discount images category'
    });
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Inventory not found for this product"
      });
    }
    
    // Generate forecast
    const forecastedDemand = await generateDemandForecast(productId, forecastDays);
    
    // Get sales trend analysis
    const salesTrend = await analyzeSalesTrend(productId);
    
    // Calculate optimal reorder parameters
    const reorderParams = await calculateReorderParameters(productId);
    
    // Get updated inventory after calculations
    const updatedInventory = await InventoryModel.findOne({ productId });
    
    return res.status(200).json({
      success: true,
      error: false,
      message: "Demand forecast generated",
      data: {
        productId,
        productName: (inventory.productId as any).title,
        currentStock: inventory.currentStock,
        availableStock: inventory.availableStock,
        forecastDays,
        forecastedDemand,
        salesVelocity: updatedInventory?.salesVelocity || 0,
        salesTrend,
        reorderPoint: reorderParams.reorderPoint,
        optimalOrderQuantity: reorderParams.optimalOrderQuantity,
        autoReorderEnabled: updatedInventory?.autoReorderEnabled || false
      }
    });
  } catch (error) {
    console.error("Error in getProductForecast:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Failed to generate demand forecast"
    });
  }
};

/**
 * Toggle auto-reorder setting for a product
 */
export const toggleProductAutoReorder = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { enabled } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Product ID is required"
      });
    }
    
    if (enabled === undefined) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Enabled parameter is required"
      });
    }
    
    const result = await toggleAutoReorder(productId, Boolean(enabled));
    
    if (!result) {
      return res.status(500).json({
        success: false,
        error: true,
        message: "Failed to update auto-reorder setting"
      });
    }
    
    return res.status(200).json({
      success: true,
      error: false,
      message: enabled ? "Auto-reorder enabled" : "Auto-reorder disabled",
      data: { productId, autoReorderEnabled: Boolean(enabled) }
    });
  } catch (error) {
    console.error("Error in toggleProductAutoReorder:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Failed to update auto-reorder setting"
    });
  }
};

/**
 * Update reorder parameters for a product
 */
export const updateProductReorderParams = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { reorderPoint, orderQuantity, leadTime } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Product ID is required"
      });
    }
    
    if (reorderPoint === undefined || orderQuantity === undefined) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Reorder point and order quantity are required"
      });
    }
    
    const result = await updateReorderParameters(
      productId, 
      Number(reorderPoint), 
      Number(orderQuantity),
      leadTime !== undefined ? Number(leadTime) : undefined
    );
    
    if (!result) {
      return res.status(500).json({
        success: false,
        error: true,
        message: "Failed to update reorder parameters"
      });
    }
    
    return res.status(200).json({
      success: true,
      error: false,
      message: "Reorder parameters updated",
      data: { 
        productId, 
        reorderPoint: Number(reorderPoint), 
        orderQuantity: Number(orderQuantity),
        leadTime: leadTime !== undefined ? Number(leadTime) : undefined
      }
    });
  } catch (error) {
    console.error("Error in updateProductReorderParams:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Failed to update reorder parameters"
    });
  }
};

/**
 * Get pending reorder requests
 */
export const getPendingReorders = async (req: Request, res: Response) => {
  try {
    const reorderRequests = await checkReorderNeeds();
    
    return res.status(200).json({
      success: true,
      error: false,
      message: "Pending reorders retrieved",
      data: reorderRequests,
      count: reorderRequests.length
    });
  } catch (error) {
    console.error("Error in getPendingReorders:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Failed to get pending reorders"
    });
  }
};

/**
 * Process all pending auto-reorders
 */
export const triggerAutoReorders = async (req: Request, res: Response) => {
  try {
    const processedCount = await processAutoReorders();
    
    return res.status(200).json({
      success: true,
      error: false,
      message: "Auto-reorders processed",
      data: {
        processedCount
      }
    });
  } catch (error) {
    console.error("Error in triggerAutoReorders:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Failed to process auto-reorders"
    });
  }
};

/**
 * Get analytics dashboard for smart inventory management
 */
export const getSmartInventoryDashboard = async (req: Request, res: Response) => {
  try {
    // Get total counts
    const totalProducts = await InventoryModel.countDocuments();
    const autoReorderEnabled = await InventoryModel.countDocuments({ autoReorderEnabled: true });
    
    // Get pending reorders
    const pendingReorders = await checkReorderNeeds();
    
    // Get at-risk products (below threshold but not yet at reorder point)
    const atRiskProducts = await InventoryModel.find({
      $and: [
        { availableStock: { $gt: 0 } },
        { $expr: { $lte: ["$availableStock", "$threshold"] } },
        { $expr: { $gt: ["$availableStock", "$reorderPoint"] } }
      ]
    }).populate({
      path: 'productId',
      select: 'title price discount images'
    }).limit(5);
    
    // Get smart inventory efficiency stats
    const allInventory = await InventoryModel.find();
    const totalStock = allInventory.reduce((sum, item) => sum + item.currentStock, 0);
    const reservedStock = allInventory.reduce((sum, item) => sum + item.reservedStock, 0);
    const forecastedDemand = allInventory.reduce((sum, item) => sum + (item.forecastedDemand || 0), 0);
    
    // Format at-risk products
    const formattedAtRiskProducts = atRiskProducts.map(item => ({
      id: item._id,
      productId: item.productId._id,
      productName: (item.productId as any).title,
      currentStock: item.currentStock,
      availableStock: item.availableStock,
      threshold: item.threshold,
      reorderPoint: item.reorderPoint,
      daysTillReorderPoint: item.salesVelocity > 0 ? 
        Math.floor((item.availableStock - item.reorderPoint) / item.salesVelocity) : null
    }));
    
    return res.status(200).json({
      success: true,
      error: false,
      message: "Smart inventory dashboard data",
      data: {
        summary: {
          totalProducts,
          autoReorderEnabled,
          pendingReorderCount: pendingReorders.length,
          atRiskCount: await InventoryModel.countDocuments({
            $and: [
              { availableStock: { $gt: 0 } },
              { $expr: { $lte: ["$availableStock", "$threshold"] } },
              { $expr: { $gt: ["$availableStock", "$reorderPoint"] } }
            ]
          })
        },
        inventory: {
          totalStock,
          reservedStock,
          availableStock: totalStock - reservedStock,
          forecastedDemand
        },
        pendingReorders: pendingReorders.slice(0, 5), // Show only top 5
        atRiskProducts: formattedAtRiskProducts
      }
    });
  } catch (error) {
    console.error("Error in getSmartInventoryDashboard:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Failed to get smart inventory dashboard"
    });
  }
};