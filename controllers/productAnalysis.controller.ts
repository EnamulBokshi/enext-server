import { Request, Response } from "express";
import { getProductDetailsFromProductPhoto, findSimilarProducts } from "../services/imageAnalysis.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Analyzes a product photo and returns detailed information
 */
const analyzeProductPhoto = asyncHandler(async (req: Request, res: Response) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "No image file provided"
      });
    }
    
    // Create a File-like object from the Multer file
    const fileFromBuffer = {
      arrayBuffer: async () => file.buffer,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    } as unknown as File;
    
    // Get detailed product analysis
    const analysisResult = await getProductDetailsFromProductPhoto(fileFromBuffer);
    
    // Get similar products suggestions
    const similarProductsResult = await findSimilarProducts(fileFromBuffer);
    
    return res.status(200).json({
      success: true,
      error: false,
      data: {
        productDetails: analysisResult.data,
        similarProducts: similarProductsResult.data
      },
      message: "Product photo analysis completed successfully"
    });
    
  } catch (error) {
    console.error("Error in product photo analysis:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error instanceof Error ? error.message : "An error occurred during product photo analysis"
    });
  }
});

/**
 * Only analyzes a product photo for detailed information without similar products
 */
const getProductInfo = asyncHandler(async (req: Request, res: Response) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "No image file provided"
      });
    }
    
    // Create a File-like object from the Multer file
    const fileFromBuffer = {
      arrayBuffer: async () => file.buffer,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    } as unknown as File;
    
    // Get detailed product analysis
    const analysisResult = await getProductDetailsFromProductPhoto(fileFromBuffer);
    
    return res.status(200).json({
      success: true,
      error: false,
      data: analysisResult.data,
      message: "Product information extracted successfully"
    });
    
  } catch (error) {
    console.error("Error extracting product information:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error instanceof Error ? error.message : "An error occurred while extracting product information"
    });
  }
});

/**
 * Only gets similar product suggestions based on the image
 */
const getSimilarProductSuggestions = asyncHandler(async (req: Request, res: Response) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "No image file provided"
      });
    }
    
    // Create a File-like object from the Multer file
    const fileFromBuffer = {
      arrayBuffer: async () => file.buffer,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    } as unknown as File;
    
    // Get similar products suggestions
    const similarProductsResult = await findSimilarProducts(fileFromBuffer);
    
    return res.status(200).json({
      success: true,
      error: false,
      data: similarProductsResult.data,
      message: "Similar product suggestions generated successfully"
    });
    
  } catch (error) {
    console.error("Error getting similar product suggestions:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error instanceof Error ? error.message : "An error occurred while getting similar product suggestions"
    });
  }
});

export {
  analyzeProductPhoto,
  getProductInfo,
  getSimilarProductSuggestions
};