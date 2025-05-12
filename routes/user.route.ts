import { NextFunction, Request, Response, Router } from "express";

const userRouter = Router();

import { createUserController, loginUserController, verifyEmailController } from "../controllers/user.controller.js";

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

userRouter.post("/", asyncHandler(createUserController))
userRouter.post("/verify-email", asyncHandler(verifyEmailController));
userRouter.post("/login",asyncHandler(loginUserController))
export default userRouter;