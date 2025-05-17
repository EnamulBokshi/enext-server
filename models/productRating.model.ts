import mongoose from "mongoose";

const productRatingSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: false
    },
    
},{
    timestamps: true
})


const ProductRatingModel = mongoose.model("ProductRating", productRatingSchema);
export default ProductRatingModel;