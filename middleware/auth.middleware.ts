import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { jwtSecret } from '../config/env.js';

// Extend the Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Define the JWT payload interface
interface JWTPayloadWithId extends JwtPayload {
  id: string;
}

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
        const decoded = jwt.verify(token, jwtSecret!) as JWTPayloadWithId;
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        // Attach userId to request
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}