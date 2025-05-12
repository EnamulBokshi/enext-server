import mongoose from "mongoose";


const subCategorySchema =  new mongoose.Schema({
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
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        }
    ]

}, {
    timestamps: true,
})

const SubCategoryModel = mongoose.model("SubCategory", subCategorySchema);
export default SubCategoryModel;