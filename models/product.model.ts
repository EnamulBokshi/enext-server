import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Product name is required"],
        default: null,
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
            ref: "category",
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
        default: 0,
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

const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;