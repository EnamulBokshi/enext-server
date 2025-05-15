import mongoose from "mongoose";

const sellsLogsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    productId: {                
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },  
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    action: {
        type: String,
        enum: ["viewed", "added_to_cart", "purchased"],
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    totalPrice: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
const SellsLogsModel = mongoose.model("SellsLogs", sellsLogsSchema);
export default SellsLogsModel;


        
