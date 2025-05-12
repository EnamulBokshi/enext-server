import mongoose from "mongoose";

const categorySchema =  new mongoose.Schema({
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
})

const CategoryModel = mongoose.model("Category", categorySchema);
export default CategoryModel;