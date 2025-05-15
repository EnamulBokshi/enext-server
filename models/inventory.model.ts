import mongoose from "mongoose";

const invenTorySchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    currentStock: {
        type: Number,
        required: true
    },
    reservedStock: {
        type: Number,
        required: true
    },
    availableStock: {
        type: Number,
        required: true
    },
    threshold: {
        type: Number,
        required: true
    },
    
},{
    timestamps: true
});
const InventoryModel = mongoose.model("Inventory", invenTorySchema);
export default InventoryModel;