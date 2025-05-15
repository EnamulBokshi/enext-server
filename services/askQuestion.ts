import googleGenAI from "../config/gemini.js";
import ProductModel from "../models/product.model.js";

export const askQuestion = async (question: string) => {
    try {
        // Fetch all products from the database to provide as context
        const products = await ProductModel.find({ publish: true })
            .select('title description price discount category sub_category unit')
            .populate('category', 'name')
            .populate('sub_category', 'name')
            .lean();

        // Format products into a string for context
        const productsContext = products.map(product => {
            return `
                Product: ${product.title}
                Description: ${product.description}
                Price: $${product.price}${product.discount > 0 ? ` (${product.discount}% off)` : ''}
                Category: ${Array.isArray(product.category) ? product.category.map((cat: any) => cat.name).join(', ') : ''}
                SubCategory: ${Array.isArray(product.sub_category) ? product.sub_category.map((subcat: any) => subcat.name).join(', ') : ''}
                Unit: ${product.unit || 'N/A'}
                    `;
        }).join('\n---\n');

        // Create instruction prompt to guide the AI's responses
        const instructionPrompt = `
            You are a helpful shopping assistant for our e-commerce platform. Your role is to:
            1. ONLY answer questions related to our products, inventory, and shopping experience
            2. Provide accurate information based on the product data provided
            3. Politely decline to answer questions unrelated to our products or store
            4. Do not make up information about products not in our database
            5. If asked about products we don't have, suggest similar products from our inventory if possible
            6. Be concise and helpful in your responses

            Below is our current product catalog:
            ${productsContext}

            User question: ${question}
            `;


        const result = googleGenAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: instructionPrompt,
        })

        return result;
    } catch (error) {
        console.error("Error asking question:", error);
        throw new Error("Failed to get a response from Gemini.");
    }
}