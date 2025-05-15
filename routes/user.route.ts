import { NextFunction, Request, Response, Router } from "express";

const userRouter = Router();

import { createUserController, forgotPasswordController, getAllUsersController, getUserDetailsController, loginUserController, logoutUserController, updateUserController, uploadAvatarController, verifyEmailController, verifyOtpController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { admin } from "../middleware/admin.middleware.js";


userRouter.post("/", asyncHandler(createUserController))
userRouter.get("/details", asyncHandler(authMiddleware), asyncHandler(getUserDetailsController)) // Changed path to /details for user details
userRouter.get("/", asyncHandler(authMiddleware), asyncHandler(admin), asyncHandler(getAllUsersController)) // Keep this path for getting all users
userRouter.post("/verify-email", asyncHandler(verifyEmailController));
userRouter.post("/login",asyncHandler(loginUserController))
userRouter.get("/logout",asyncHandler(authMiddleware), asyncHandler(logoutUserController))
userRouter.put("/upload-avatar", asyncHandler(authMiddleware), asyncHandler(upload.single('avatar')),asyncHandler(uploadAvatarController))
userRouter.put("/update-user", asyncHandler(authMiddleware),asyncHandler(updateUserController))
userRouter.put("/forgot-password",  asyncHandler(forgotPasswordController))
userRouter.put("/verify-otp", asyncHandler(verifyOtpController));

export default userRouter;