import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
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
    action: {
        type: String,
        enum: ["viewed", "added_to_cart", "purchased"],
        required: true,
    },
}, {
    timestamps: true,
});
const HistoryModel = mongoose.model("History", historySchema);
export default HistoryModel;