import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { admin } from "../middleware/admin.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { 
    getInventoryAssist, 
    getInventoryOverview, 
    getInventoryByCategory,
    searchInventory
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

export default inventoryAssistRouter;