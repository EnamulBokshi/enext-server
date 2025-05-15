import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    activityType: {
        type: String,
        enum: [
            "product_view", 
            "search", 
            "category_view", 
            "add_to_cart",
            "remove_from_cart", 
            "checkout", 
            "purchase", 
            "review", 
            "login", 
            "logout",
            "favorites",
            "page_view"
        ],
        required: true,
    },
    metadata: {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        subCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
        },
        searchQuery: String,
        timeSpent: Number, // Time spent in seconds
        page: String,
        referrer: String,
        device: String,
        browser: String
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    sessionId: {
        type: String,
    }
}, {
    timestamps: true
});

// Create an index for faster queries
userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ activityType: 1 });

const UserActivityModel = mongoose.model("UserActivity", userActivitySchema);
export default UserActivityModel;