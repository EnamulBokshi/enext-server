import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { admin } from "../middleware/admin.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { 
    getInventoryAssist, 
    getInventoryOverview, 
    getInventoryByCategory,
    searchInventory,
    getProductForecast,
    toggleProductAutoReorder,
    updateProductReorderParams,
    getPendingReorders,
    triggerAutoReorders,
    getSmartInventoryDashboard
} from "../controllers/inventoryAssist.controller.js";

const inventoryAssistRouter = Router();

// Apply authentication middleware to all routes
inventoryAssistRouter.use(asyncHandler(authMiddleware));

// AI-powered inventory assistant endpoint
inventoryAssistRouter.post("/ask", asyncHandler(getInventoryAssist));

// Inventory overview dashboard data
inventoryAssistRouter.get("/overview", asyncHandler(admin), asyncHandler(getInventoryOverview));

// Category-wise inventory distribution
inventoryAssistRouter.get("/by-category", asyncHandler(admin), asyncHandler(getInventoryByCategory));

// Search and filter inventory
inventoryAssistRouter.get("/search", asyncHandler(admin), asyncHandler(searchInventory));

// Smart inventory management endpoints
inventoryAssistRouter.get("/smart-dashboard", asyncHandler(admin), asyncHandler(getSmartInventoryDashboard));
inventoryAssistRouter.get("/forecast/:productId", asyncHandler(admin), asyncHandler(getProductForecast));
inventoryAssistRouter.post("/auto-reorder/:productId", asyncHandler(admin), asyncHandler(toggleProductAutoReorder));
inventoryAssistRouter.put("/reorder-params/:productId", asyncHandler(admin), asyncHandler(updateProductReorderParams));
inventoryAssistRouter.get("/pending-reorders", asyncHandler(admin), asyncHandler(getPendingReorders));
inventoryAssistRouter.post("/process-reorders", asyncHandler(admin), asyncHandler(triggerAutoReorders));

export default inventoryAssistRouter;