import express from 'express';
import upload from '../middleware/multer.middleware.js';
import { analyzeProductPhoto, getProductInfo, getSimilarProductSuggestions } from '../controllers/productAnalysis.controller.js';

const router = express.Router();

/**
 * @route POST /api/product-analysis/analyze
 * @description Analyze a product photo for full details and similar product suggestions
 * @access Public
 */
router.post('/analyze',  upload.single('image'), analyzeProductPhoto);

/**
 * @route POST /api/product-analysis/product-info
 * @description Extract detailed product information from a photo
 * @access Public
 */
router.post('/product-info', upload.single('image'), getProductInfo);

/**
 * @route POST /api/product-analysis/similar-products
 * @description Get similar product suggestions based on an image
 * @access Public
 */
router.post('/similar-products', upload.single('image'), getSimilarProductSuggestions);

export default router;