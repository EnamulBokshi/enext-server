import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { admin } from "../middleware/admin.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { 
    getInventoryController, 
    getProductInventoryController, 
    getLowStockInventoryController,
    updateInventoryController
} from "../services/inventory.service.js";

const inventoryRouter = Router();

// Apply authentication middleware to all routes
inventoryRouter.use(asyncHandler(authMiddleware));

// Get all inventory with pagination
inventoryRouter.get('/', asyncHandler(admin), asyncHandler(getInventoryController));

// Get low stock inventory items (those at or below threshold)
inventoryRouter.get('/low-stock', asyncHandler(admin), asyncHandler(getLowStockInventoryController));

// Get inventory for a specific product
inventoryRouter.get('/product/:productId', asyncHandler(getProductInventoryController));

// Update inventory stock levels (admin only)
inventoryRouter.put('/update', asyncHandler(admin), asyncHandler(updateInventoryController));

export default inventoryRouter;