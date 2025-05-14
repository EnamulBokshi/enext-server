import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
    },
    avatar: {
        type: String,
        default: "https://www.gravatar.com/avatar/?d=mp",
    }
    ,
    mobile: {
        type: Number,
        default: null,
    },
    refresh_token: {
        type: String,
        default: null,
    },
    verify_email : {
        type: Boolean,
        default: false,
    },
    last_login: {
        type: Date,
        default: null,
    },
    status:{
        type: String,
        enum: ["active", "inactive","banned"],
        default: "active",
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN", "SUPERADMIN"],
        default: "USER",
    },
    address_details:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
        }
    ],
    shopping_cart:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "cartProduct",
        }
    ],
    orderHistory:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order",
        }
    ],
    fortgot_password_token: {
        type: String,
        default: null,
    },
    fortgot_password_expire: {
        type: Date,
        default: null,
    }
   
},{
    timestamps: true,
})

const UserModel = mongoose.model("User", userSchema);
export default UserModel;