import { Response, Request } from "express";
import { vendorAssist } from "../services/vendorsAsistance.js";
import InventoryModel from "../models/inventory.model.js";
import ProductModel from "../models/product.model.js";

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