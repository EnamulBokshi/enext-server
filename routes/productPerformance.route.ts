import express from 'express';
import { getProductPerformance, getTopProducts } from '../controllers/productPerformance.controller.js';
import { admin } from '../middleware/admin.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(asyncHandler(authMiddleware));

// Get performance metrics for a specific product
// Requires admin privileges
router.get('/metrics', asyncHandler(admin), getProductPerformance);

// Get top performing products
// Requires admin privileges
router.get('/top', asyncHandler(admin), getTopProducts);

export default router;