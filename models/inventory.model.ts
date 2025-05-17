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
        required: true,
        default: 2
    },
    threshold: {
        type: Number,
        required: false,
        default: 2
    },
    // Smart inventory management fields
    forecastedDemand: {
        type: Number,
        default: 0
    },
    autoReorderEnabled: {
        type: Boolean,
        default: false
    },
    reorderPoint: {
        type: Number,
        default: 5
    },
    optimalOrderQuantity: {
        type: Number,
        default: 10
    },
    leadTime: {
        type: Number,
        default: 7, // in days
    },
    seasonality: {
        type: Map,
        of: Number,
        default: {}
    },
    lastReorderDate: {
        type: Date,
        default: null
    },
    salesVelocity: {
        type: Number,
        default: 0 // Units sold per day
    },
    // Historical sales data for trend analysis
    salesHistory: [{
        date: {
            type: Date,
            required: true
        },
        quantity: {
            type: Number,
            default: 0
        }
    }]
},{
    timestamps: true
});

// Add index for faster queries on threshold values
invenTorySchema.index({ availableStock: 1, threshold: 1 });

const InventoryModel = mongoose.model("Inventory", invenTorySchema);
export default InventoryModel;