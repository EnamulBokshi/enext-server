import  jwt  from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { jwtSecret } from '../config/env.js';



export const authMiddleware = async (req:Request, res:Response, next:NextFunction)=>{
    try {
        const token = req.headers?.authorization?.split(" ")[1] || req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        // Verify the token
        const decoded = jwt.verify(token, jwtSecret!);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        // Attach user to request
        // req.user = decoded;
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}