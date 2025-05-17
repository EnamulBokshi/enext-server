import { Router, Response, Request} from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { admin } from "../middleware/admin.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

import { 
    getInventoryController, 
    getProductInventoryController, 
    getLowStockInventoryController,
    updateInventoryController,
    reconcileInventoryController
} from "../services/inventory.service.js";
import { validateAllInventory } from "../services/smartInventory/inventorySync.js";

const inventoryRouter = Router();

// Apply authentication middleware to all routes
inventoryRouter.use(asyncHandler(authMiddleware));

// Get all inventory with pagination
inventoryRouter.get('/', asyncHandler(admin), asyncHandler(getInventoryController));

// 

inventoryRouter.get('/public', asyncHandler(getInventoryController));

// Get low stock inventory items (those at or below threshold)
inventoryRouter.get('/low-stock', asyncHandler(admin), asyncHandler(getLowStockInventoryController));

// Get inventory for a specific product
inventoryRouter.get('/product/:productId', asyncHandler(getProductInventoryController));

// Update inventory stock levels (admin only)
inventoryRouter.put('/update', asyncHandler(admin), asyncHandler(updateInventoryController));

// Smart inventory reconciliation endpoints
inventoryRouter.post('/reconcile/:productId', asyncHandler(admin), asyncHandler(reconcileInventoryController));

// System-wide inventory reconciliation
inventoryRouter.post('/reconcile-all', asyncHandler(admin), asyncHandler(async (req:Request, res:Response) => {
    try {
        const result = await validateAllInventory();
        
        return res.json({
            message: `Inventory reconciliation completed. Processed ${result.processed} items, corrected ${result.corrected} discrepancies.`,
            data: result,
            error: false,
            success: true
        });
    } catch (error) {
        console.error("Error reconciling all inventory:", error);
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
}));

export default inventoryRouter;