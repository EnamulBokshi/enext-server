import googleGenAI from "../config/gemini.js";
import ProductModel from "../models/product.model.js";
import InventoryModel from "../models/inventory.model.js";

export const vendorAssist = async (question: string) => {
    try {
        // Fetch products with inventory information from the database
        const inventory = await InventoryModel.find()
            .populate({
                path: 'productId',
                select: 'title description price discount category sub_category unit images',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'sub_category', select: 'name' }
                ]
            })
            .lean();

        // Format inventory data into a string for context
        const inventoryContext = inventory.map(item => {
            const product = item.productId as any;
            
            // Calculate discount price if applicable
            const discountedPrice = product.discount > 0 
                ? (product.price - (product.price * product.discount / 100)).toFixed(2) 
                : null;
                
            // Determine stock status
            let stockStatus = "In Stock";
            if (item.availableStock <= 0) {
                stockStatus = "Out of Stock";
            } else if (item.availableStock <= (item.threshold ?? 0)) {
                stockStatus = "Low Stock";
            }
            
            return `
                Product: ${product.title}
                Description: ${product.description || 'No description available'}
                Price: $${product.price}${product.discount > 0 ? ` (${product.discount}% off - $${discountedPrice})` : ''}
                Category: ${Array.isArray(product.category) ? product.category.map((cat: any) => cat.name).join(', ') : (product.category?.name || 'Uncategorized')}
                SubCategory: ${Array.isArray(product.sub_category) ? product.sub_category.map((subcat: any) => subcat.name).join(', ') : (product.sub_category?.name || 'None')}
                Unit: ${product.unit || 'N/A'}
                Current Stock: ${item.currentStock}
                Available Stock: ${item.availableStock}
                Reserved Stock: ${item.reservedStock}
                Stock Status: ${stockStatus}
                Restock Threshold: ${item.threshold}
            `;
        }).join('\n---\n');

        // Create instruction prompt to guide the AI's responses with inventory focus
        const instructionPrompt = `
            You are a helpful inventory and shopping assistant for our e-commerce platform. Your role is to:
            1. Answer questions about our inventory, product stock levels, and availability
            2. Provide insights on which products are running low on stock or out of stock
            3. Explain when products might be back in stock based on threshold levels
            4. Help customers understand product availability and stock status
            5. Suggest alternative products that are in stock if asked about out-of-stock items
            6. Only answer questions related to our products, inventory, and shopping experience
            7. Be accurate and helpful in your responses about stock levels
            8. For products with "Low Stock" status, notify customers that they should order soon
            9. For out-of-stock products, apologize and suggest when they might be back
            10. Do not make up information about products or inventory not in our database

            Below is our current inventory with product details:
            ${inventoryContext}

            User question: ${question}
            `;

        const result = await googleGenAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: instructionPrompt,
        });

        return result.candidates?.[0]?.content?.parts?.[0] ?? null;

    } catch (error) {
        console.error("Error processing inventory assistance:", error);
        throw new Error("Failed to get inventory information from Gemini.");
    }
}