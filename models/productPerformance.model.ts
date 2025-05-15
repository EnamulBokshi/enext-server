import mongoose from "mongoose";

const productPerformanceSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true
    },
    views: {
        type: Number,
        default: 0
    },
    searches: {
        type: Number,
        default: 0
    },
    addedToCart: {
        type: Number,
        default: 0
    },
    purchases: {
        type: Number,
        default: 0
    },
    totalSold: {
        type: Number,
        default: 0
    },
    revenue: {
        type: Number,
        default: 0
    },
    // Array to store daily metrics for time-series analysis
    dailyMetrics: [{
        date: {
            type: Date,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        searches: {
            type: Number,
            default: 0
        },
        addedToCart: {
            type: Number,
            default: 0
        },
        purchases: {
            type: Number,
            default: 0
        },
        totalSold: {
            type: Number,
            default: 0
        },
        revenue: {
            type: Number,
            default: 0
        }
    }]
}, {
    timestamps: true
});

// Create compound index for faster querying
productPerformanceSchema.index({ productId: 1, createdAt: -1 });

const ProductPerformanceModel = mongoose.model("ProductPerformance", productPerformanceSchema);
export default ProductPerformanceModel;