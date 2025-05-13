import { NextFunction, Request, Response, Router } from "express";

const userRouter = Router();

import { createUserController, forgotPasswordController, loginUserController, logoutUserController, updateUserController, uploadAvatarController, verifyEmailController, verifyOtpController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

userRouter.post("/", asyncHandler(createUserController))
userRouter.post("/verify-email", asyncHandler(verifyEmailController));
userRouter.post("/login",asyncHandler(loginUserController))
userRouter.get("/logout",asyncHandler(authMiddleware), asyncHandler(logoutUserController))
userRouter.put("/upload-avatar", asyncHandler(authMiddleware), asyncHandler(upload.single('avatar')),asyncHandler(uploadAvatarController))
userRouter.put("/update-user", asyncHandler(authMiddleware),asyncHandler(updateUserController))
userRouter.put("/forgot-password",  asyncHandler(forgotPasswordController))
userRouter.put("/verify-otp", asyncHandler(verifyOtpController));

export default userRouter;