import mongoose from "mongoose";


const cartSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    quantity:{
        type: Number,
        default: 1,
    }
},{
    timestamps: true,
});


const CartModel = mongoose.model("Cart", cartSchema);
export default CartModel;