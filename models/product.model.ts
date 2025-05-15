import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Product name is required"],
        default: null,
    },
    slug:{
        type: String,
        required: [true, "Product slug is required"],
        default: null,
        unique: true,
        lowercase: true,
    },
    images: {
        type: Array,
        required: [true, "Product images are required"],
        default: [],
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        default: null,
    },
    category: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category", // Updated to match the registered model name
        }
    ],
    sub_category: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
        }
    ],

    unit: {
        type: String,
        default: ""
    },
    currentStock :{
        type: Number,
        default: 1,
    },
    price:{
        type: Number,
        required: [true, "Product price is required"],
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    publish: {
        type: Boolean,
        default: true,
    }

},{
    timestamps: true,
});

// Create text index on title, description, and slug fields
productSchema.index(
    { 
        title: 'text', 
        description: 'text',
        slug: 'text' 
    }, 
    {
        weights: {
            title: 10,
            slug: 5,
            description: 3
        },
        name: "ProductTextIndex"
    }
);

const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;