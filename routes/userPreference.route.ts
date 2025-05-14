import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { 
    getUserActivityController, 
    getUserPreferencesController, 
    getPersonalizedRecommendationsController, 
    updateUserPreferencesController 
} from '../controllers/userPreference.controller.js';
import asyncHandler from '../utils/asyncHandler.js';

const preferenceRouter = Router();

// Get user preferences
preferenceRouter.get('/', asyncHandler(authMiddleware), asyncHandler(getUserPreferencesController));

// Update user preferences
preferenceRouter.put('/', asyncHandler(authMiddleware), asyncHandler(updateUserPreferencesController));

// Get user activity
preferenceRouter.get('/activity', asyncHandler(authMiddleware), asyncHandler(getUserActivityController));

// Get personalized recommendations
preferenceRouter.get('/recommendations', asyncHandler(authMiddleware), asyncHandler(getPersonalizedRecommendationsController));

export default preferenceRouter;