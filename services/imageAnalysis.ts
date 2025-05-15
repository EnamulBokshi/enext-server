import googleGenAI from "../config/gemini.js";

/**
 * Analyzes a product photo and extracts detailed information
 * @param image File object containing the product image
 * @returns Structured product information extracted from the image
 */
const getProductDetailsFromProductPhoto = async (image: File) => {
  try {
    // Convert image to base64 for Gemini API
    const imageBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    // Create a file part for the image
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: image.type,
      },
    };

    // Define structured analysis prompt
    const analysisPrompt = `
    You are a specialized product image analyzer for an e-commerce platform. Analyze the provided product image in detail and extract the following information:
    
    1. Product name/title
    2. Brand/manufacturer
    3. Product category
    4. Price (if visible)
    5. Model/SKU number (if visible)
    6. Key features visible in the image
    7. Product condition (new, used, etc.)
    8. Expiration date (if applicable)
    9. Package details (size, material, etc.)
    10. Any text visible on packaging
    
    Format your response as a JSON object with these fields. If any information cannot be determined from the image, use null for that field. Be as accurate and detailed as possible.
    `;

    // Call Gemini model with the image and prompt
    // const model = googleGenAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    // const result = await model.generateContent([
    //   analysisPrompt,
    //   imagePart
    // ]);
    const result = await googleGenAI.models.generateContent({
        model:'gemini-2.0-flash',
        contents:[
            { role: "user", parts: [{ text: analysisPrompt }, imagePart] }
        ],
    })
    const response = result?.candidates?.[0]?.content?.parts?.[0] ?? null;
    const textResponse = response?.text ?? null;
    
    // Extract JSON from response if needed
    let structuredData;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = textResponse?.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        structuredData = JSON.parse(jsonMatch[1].trim());
      } else {
        // Otherwise parse the entire response if it's valid JSON
        structuredData = textResponse ? JSON.parse(textResponse): null;
      }
    } catch (e) {
      // If parsing fails, return the raw text
      structuredData = { rawAnalysis: textResponse };
    }
    
    return {
      success: true,
      data: structuredData,
      rawResponse: textResponse
    };
  } catch (error) {
    console.error("Error analyzing product image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in image analysis",
      rawResponse: null
    };
  }
};

/**
 * Identifies similar products based on an image
 * @param image File object containing the product image
 * @returns Suggestions for similar products
 */
const findSimilarProducts = async (image: File) => {
  try {
    // Convert image to base64 for Gemini API
    const imageBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    // Create a file part for the image
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: image.type,
      },
    };

    // Define structured analysis prompt
    const similarProductsPrompt = `
    You are a product matching specialist for an e-commerce platform. Based on the provided product image:
    
    1. Identify the main product type/category
    2. Suggest 3-5 related product types that customers might be interested in
    3. List potential search terms a customer might use to find this product
    
    Format your response as a JSON object with fields: 'mainCategory', 'relatedProducts', and 'searchTerms'.
   
    `;

    const result = await googleGenAI.models.generateContent({
        model:'gemini-2.0-flash',
        contents:[
            { role: "user", parts: [{ text: similarProductsPrompt }, imagePart] }
        ],
    })
    const response = result?.candidates?.[0]?.content?.parts?.[0] ?? null;
    const textResponse = response?.text ?? null;
    
    // Extract JSON from response
    let structuredData;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = textResponse?.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        structuredData = JSON.parse(jsonMatch[1].trim());
      } else {
        // Otherwise parse the entire response if it's valid JSON
        structuredData = textResponse ? JSON.parse(textResponse) : null
      }
    } catch (e) {
      // If parsing fails, return the raw text
      structuredData = { rawAnalysis: textResponse };
    }
    
    return {
      success: true,
      data: structuredData,
      rawResponse: textResponse
    };
  } catch (error) {
    console.error("Error finding similar products:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in finding similar products",
      rawResponse: null
    };
  }
};

export { 
  getProductDetailsFromProductPhoto,
  findSimilarProducts
};