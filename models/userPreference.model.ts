import mongoose from "mongoose";

const userPreferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    preferredCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }],
    preferredSubCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory"
    }],
    priceRange: {
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 1000000
        }
    },
    searchHistory: [{
        query: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    favoriteProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    preferences: {
        // Store any additional custom preferences as key-value pairs
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

const UserPreferenceModel = mongoose.model("UserPreference", userPreferenceSchema);
export default UserPreferenceModel;