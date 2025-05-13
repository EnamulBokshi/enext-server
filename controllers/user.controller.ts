import { Request, Response } from "express";
import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import sendEmail from "../services/sendEmail.service.js";
import verificationEmailTemplate from "../utils/verifyEmailTemplate.js";
import { frontEndUrl, nodeEnv } from "../config/env.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";

export async function createUserController(req: Request, res: Response) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }
        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const userData = {
            name,
            email,
            password: hashedPassword,
        };
        const newUser = new UserModel(userData);
        const user = await newUser.save();
        
       
        const verifyLink = `${frontEndUrl}/verify-email/?userId=${user._id}`;
        try {
            const vefiryEmail = await sendEmail({
                name: user.name,
                subject: "Verify your email",
                sendTo: user.email,
                html: verificationEmailTemplate({name: user.name, link: verifyLink}),
            })
        }catch(error: unknown){
            console.error("Error sending email:", error);
            let errorMessage = "Something went wrong";
            if(error instanceof Error){
                errorMessage = error.message;
            }
           
        }

        // Send email to admin
        try{
            const sendNotification = await sendEmail({
                name: "Admin",
                subject: "New user registered",
                sendTo: "haque22205101946@diu.edu.bd",
                html: `<h1>New user registered</h1>
                <p>Name: ${user.name}</p>
                <p>Email: ${user.email}</p>`
            })

        }catch(error: unknown){
            console.error("Error sending email:", error);
        }
        
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user,
        });
    } catch(error: unknown) {
        console.error("Error creating user:", error);
        
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        
        return res.status(500).json(
            {
                success: false,
                message: "Internal server error",
                error: errorMessage
            }
        );
    }
}

export const verifyEmailController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
        // Find the user by ID
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Update the user's email verification status
        user.verify_email = true;
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user,
        });
    } catch (error: unknown) {
        console.error("Error verifying email:", error);
        
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        
        return res.status(500).json(
            {
                success: false,
                message: "Internal server error",
                error: errorMessage
            }
        );
    }
}

export const loginUserController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
        // Check if user exists
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        // if(!user.verify_email) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Email not verified"
        //     });
        // }

        if(user.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "User is not active or banned"
            });
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        

        const accessToken = await generateAccessToken(user._id );
        const refreshToken = await generateRefreshToken(user._id);



        // Update the user's last login time
        user.last_login = new Date();
        await user.save();

        const cookieOptions = {
            httpOnly: true,
            secure: nodeEnv === "production",
            // sameSite: nodeEnv === "production" ? "none" : "lax",
        }
        res.cookie('refreshToken', refreshToken, cookieOptions);
        res.cookie('accessToken', accessToken, cookieOptions);
        res.cookie('userId', user._id, {
            httpOnly: true,
            secure: nodeEnv === "production",
            sameSite: nodeEnv === "production" ? "none" : "lax",
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                accessToken,
                refreshToken,
                user, 
            }
        });
    } catch (error: unknown) {
        console.error("Error logging in user:", error);
        
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        
        return res.status(500).json(
            {
                success: false,
                message: "Internal server error",
                error: errorMessage
            }
        );
    }
}

export const logoutUserController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
        // Find the user by ID
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Update the user's refresh token
        user.refresh_token = "";
        await user.save();
        
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        res.clearCookie("userId");
        
        return res.status(200).json({
            success: true,
            message: "User logged out successfully",
            user,
        });
    } catch (error: unknown) {
        console.error("Error logging out user:", error);
        
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        
        return res.status(500).json(
            {
                success: false,
                message: "Internal server error",
                error: errorMessage
            }
        );
    }
}