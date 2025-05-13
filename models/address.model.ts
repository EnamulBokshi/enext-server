import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    address_line1: {
        type: String,
        required: [true, "Address line 1 is required"],
        default: null,
    },
    address_line2: {
        type: String,
        required: false,
        default: "",
    },
    city: {
        type: String,
        required: [true, "City is required"],
        default: "",
    },
    state: {
        type: String, 
        default: "",
    },
    zip_code: {
        type: String,
        required: [true, "Zip code is required"],
        default: "",
    },
    country:{
        type: String,
        required: [true, "Country is required"],
        default: "Bangladesh",
    },
    mobile: {
        type: Number,
        default: null,
    },
    status: {
        type: Boolean,
        default: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
},{
    timestamps: true,
})

const AddressModel = mongoose.model("Address", addressSchema);
export default AddressModel;