import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    orderId: {
        type: String,
        required: [true, "Order ID is required"],
        unique: true,
    },  
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }
    ],
 
    product_details: {
        name: String,
        image: Array,
    },
    paymentId: {
        type: String,
        default: "",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
    shippingAddress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
        }
    ],
    subTotalAmount: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        default: 0,
    },
    orderStatus: {
        type: String,
        enum: ["pending", "shipped", "delivered", "cancelled"],
        default: "pending",
    },
    invoiceUrl: {
        type: String,
        default: "",
    },

}, {
    timestamps: true,
})


const OrderModel = mongoose.model("Order", orderSchema);
export default OrderModel;