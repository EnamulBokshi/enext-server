"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var subCategorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Subcategory name is required"],
        default: "",
    },
    slug: {
        type: String,
        required: [true, "Subcategory slug is required"],
        default: "",
    },
    image: {
        type: String,
        required: false,
        default: "https://www.gravatar.com/avatar/",
    },
    description: {
        type: String,
        required: false,
        default: "",
    },
    category: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Category",
        }
    ]
}, {
    timestamps: true,
});
var SubCategoryModel = mongoose_1.default.model("SubCategory", subCategorySchema);
exports.default = SubCategoryModel;
