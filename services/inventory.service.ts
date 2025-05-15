import InventoryModel from "../models/inventory.model.js";
import ProductModel from "../models/product.model.js";
import { Request, Response } from "express";

/**
 * Service function to update inventory when products are added to cart
 */
export const reserveInventory = async (productId: string, quantity: number) => {
    try {
        // Find the inventory for this product
        const inventory = await InventoryModel.findOne({ productId });
        
        if (!inventory) {
            console.error(`Inventory not found for product ID: ${productId}`);
            return false;
        }
        
        // Check if there's enough available stock
        if (inventory.availableStock < quantity) {
            return false;
        }
        
        // Update inventory
        inventory.reservedStock += quantity;
        inventory.availableStock = inventory.currentStock - inventory.reservedStock;
        
        await inventory.save();
        return true;
    } catch (error) {
        console.error("Error reserving inventory:", error);
        return false;
    }
};

/**
 * Service function to release inventory when products are removed from cart
 */
export const releaseInventory = async (productId: string, quantity: number) => {
    try {
        // Find the inventory for this product
        const inventory = await InventoryModel.findOne({ productId });
        
        if (!inventory) {
            console.error(`Inventory not found for product ID: ${productId}`);
            return false;
        }
        
        // Update inventory (ensure reserved stock doesn't go below 0)
        inventory.reservedStock = Math.max(0, inventory.reservedStock - quantity);
        inventory.availableStock = inventory.currentStock - inventory.reservedStock;
        
        await inventory.save();
        return true;
    } catch (error) {
        console.error("Error releasing inventory:", error);
        return false;
    }
};

/**
 * Service function to confirm inventory deduction when orders are placed
 */
export const confirmInventoryDeduction = async (productId: string, quantity: number) => {
    try {
        // Find the inventory for this product
        const inventory = await InventoryModel.findOne({ productId });
        
        if (!inventory) {
            console.error(`Inventory not found for product ID: ${productId}`);
            return false;
        }
        
        // Update inventory
        inventory.currentStock = Math.max(0, inventory.currentStock - quantity);
        inventory.reservedStock = Math.max(0, inventory.reservedStock - quantity);
        inventory.availableStock = inventory.currentStock - inventory.reservedStock;
        
        await inventory.save();
        return true;
    } catch (error) {
        console.error("Error confirming inventory deduction:", error);
        return false;
    }
};

/**
 * Controller function to get all inventory items
 */
export const getInventoryController = async (req: Request, res: Response) => {
    try {
        // Get query parameters for pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalCount = await InventoryModel.countDocuments();
        
        // Get inventory items with pagination and populate product details
        const inventory = await InventoryModel.find()
            .populate({
                path: 'productId',
                select: 'title images'
            })
            .skip(skip)
            .limit(limit)
            .sort({ availableStock: 1 }); // Sort by available stock (lowest first)
        
        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        
        return res.json({
            message: "Inventory data retrieved successfully",
            data: inventory,
            pagination: {
                totalCount,
                totalPages,
                currentPage: page,
                limit
            },
            error: false,
            success: true
        });
    } catch (error) {
        console.error("Error getting inventory:", error);
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};

/**
 * Controller function to get inventory for a specific product
 */
export const getProductInventoryController = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }
        
        // Get inventory for the specific product
        const inventory = await InventoryModel.findOne({ productId }).populate({
            path: 'productId',
            select: 'title images price discount'
        });
        
        if (!inventory) {
            return res.status(404).json({
                message: "Inventory not found for this product",
                error: true,
                success: false
            });
        }
        
        return res.json({
            message: "Product inventory retrieved successfully",
            data: inventory,
            error: false,
            success: true
        });
    } catch (error) {
        console.error("Error getting product inventory:", error);
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};

/**
 * Controller function to get low stock inventory items
 */
export const getLowStockInventoryController = async (req: Request, res: Response) => {
    try {
        // Get inventory items where available stock is at or below threshold
        const lowStockItems = await InventoryModel.find({
            $expr: {
                $lte: ["$availableStock", "$threshold"]
            }
        }).populate({
            path: 'productId',
            select: 'title images price discount'
        });
        
        return res.json({
            message: "Low stock inventory items retrieved successfully",
            data: lowStockItems,
            count: lowStockItems.length,
            error: false,
            success: true
        });
    } catch (error) {
        console.error("Error getting low stock inventory:", error);
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};

/**
 * Controller function to update inventory stock
 */
export const updateInventoryController = async (req: Request, res: Response) => {
    try {
        const { productId, currentStock, threshold } = req.body;
        
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }
        
        // Find the inventory for this product
        const inventory = await InventoryModel.findOne({ productId });
        
        if (!inventory) {
            return res.status(404).json({
                message: "Inventory not found for this product",
                error: true,
                success: false
            });
        }
        
        // Update inventory fields if provided
        if (currentStock !== undefined) {
            inventory.currentStock = currentStock;
            // Recalculate available stock
            inventory.availableStock = currentStock - inventory.reservedStock;
        }
        
        if (threshold !== undefined) {
            inventory.threshold = threshold;
        }
        
        // Save the updated inventory
        await inventory.save();
        
        return res.json({
            message: "Inventory updated successfully",
            data: inventory,
            error: false,
            success: true
        });
    } catch (error) {
        console.error("Error updating inventory:", error);
        let errorMessage = "Something went wrong";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return res.status(500).json({
            message: errorMessage,
            error: true,
            success: false
        });
    }
};