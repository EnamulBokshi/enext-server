import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/env.js";
import UserModel from "../models/user.model.js";
import { Types } from "mongoose";

const generateRefreshToken = async(userId: Types.ObjectId | string)  => {
    const token = jwt.sign({ id: userId }, jwtSecret!, {
        expiresIn: '30d',
    });
    const updateRefreshToken = await UserModel.findByIdAndUpdate(userId,{
        refreshToken: token,
    })
    return token;
}
export default generateRefreshToken;