import { Request, Response } from "express";
import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import sendEmail from "../services/sendEmail.service.js";
import verificationEmailTemplate from "../utils/verifyEmailTemplate.js";
import { frontEndUrl, nodeEnv } from "../config/env.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import uploadImageCloudinary from "../services/uploadImageCloudinary.js";
import generateOtp from "../utils/generateOtp.js";

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
        const userId  = req.userId;
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

export const uploadAvatarController = async (req: Request, res: Response) => {
    try {
        const image = req.file;
        console.log("Image:", image);

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }

        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Create a File-like object from the Multer file
        const fileFromBuffer = {
            arrayBuffer: async () => image.buffer,
            name: image.originalname,
            size: image.size,
            type: image.mimetype,
        } as unknown as File;

        const uploadResult = await uploadImageCloudinary(fileFromBuffer);

        // Find the user by ID and update avatar
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Update the user's avatar with the Cloudinary URL
        user.avatar = uploadResult.secure_url;
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: "Avatar uploaded successfully",
            user,
        });
    } catch (error: unknown) {
        console.error("Error uploading avatar:", error);
        
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


// Update user details
export const updateUserController = async (req: Request, res: Response) => {
    try{
        const userId = req.userId; // Get user id from auth middleware
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
        const { name, email, password, mobile} = req.body;
        if (!name && !email && !password) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required to update"
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

        let hashedPassword = "";
        if(password){
            const salt = await bcrypt.genSalt(10);
             hashedPassword = await bcrypt.hash(password, salt);
        }

        // Update user details
        const updatedUserDta = await UserModel.findByIdAndUpdate(userId,{
            ...(name && {name}),
            ...(email && {email}),
            ...(mobile && {mobile}),
            ...(password && {password: hashedPassword}),
        })
        if (!updatedUserDta) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Send email to admin
        try{
            const sendNotification = await sendEmail({
                name: "Admin",
                subject: "User updated",
                sendTo: "haque22205101946@diu.edu.bd",
                html: `<h1>User updated</h1>
                <p>Name: ${updatedUserDta.name}</p>
                <p>Email: ${updatedUserDta.email}</p>`
            })

            console.log("Email sent successfully:", sendNotification);
            // Send email to user
            // const sendUserNotification = await sendEmail({
            //     name: updatedUserDta.name,
            //     subject: "Your account has been updated",
            //     sendTo: updatedUserDta.email,
            //     html: `<h1>Your account has been updated successfully</h1>`
            // })
            // console.log("Email sent successfully:", sendUserNotification);

        }catch(error: unknown){
            console.error("Error sending email:", error);
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            
            user: updatedUserDta,
        });
    }catch (error: unknown) {
        console.error("Error updating user:", error);
        
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


// reset password (forgot password)
export const forgotPasswordController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }
        // Check if user exists
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const otp = generateOtp();
        const expireTime = new Date(new Date().getTime() + 60 * 60 * 1000); // 60 minutes from now
        
        user.fortgot_password_expire = expireTime;
        user.fortgot_password_token = otp.toString();
        
        await user.save({ validateBeforeSave: false });
        // Generate reset password token


        try{
            await sendEmail({
                name: user?.name,
                subject: "Reset your password",
                sendTo: user?.email,
                html: `<h1>Reset your password</h1>
                <p style="padding: 10x 16px; font-weight: bold; background: green; color:white; text-align:center border-radious: 20px">Your OTP is: ${otp}</p>
                <p>Please use this OTP to reset your password. It will expire in 60 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>`
            })
        }catch(error: unknown){
            console.error("Error sending email:", error);
            let errorMessage = "Something went wrong";
        }
        // const resetToken = user.createPasswordResetToken();
        // await user.save({ validateBeforeSave: false });

        // Create reset password link
        // const resetLink = `${frontEndUrl}/reset-password/${resetToken}`;
        
        // Send email to user
  
        return res.status(200).json({
            success: true,
            message: "Reset password link sent to your email",
        });
    } catch (error: unknown) {
        console.error("Error sending reset password email:", error);
        
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

export const verifyOtpController = async (req: Request, res: Response) => {
    try {
        const { otp,email } = req.body;
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required"
            });
        }
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
        // Find the user by ID
        const user = await UserModel.findById(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Check if OTP is correct
        if (user.fortgot_password_token !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }
        // Check if OTP is expired
        if (user.fortgot_password_expire < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            
        });
    } catch (error: unknown) {
        console.error("Error verifying OTP:", error);
        
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