import ProductModel from "../models/product.model.js";

const getProductsContext = async () =>{
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

        return productsContext;
    } catch (error) {
        console.error("Error fetching products context:", error);
        throw new Error("Failed to fetch products context.");
    }
}

export default getProductsContext;
// This function fetches the product context from the database and formats it for use in the AI model