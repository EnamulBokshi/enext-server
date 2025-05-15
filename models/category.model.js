"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var categorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        default: "",
    },
    slug: {
        type: String,
        required: [true, "Category slug is required"],
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
}, {
    timestamps: true,
});
var CategoryModel = mongoose_1.default.model("Category", categorySchema);
exports.default = CategoryModel;
