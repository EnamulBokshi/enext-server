import { Router } from "express";
const assistRouter = Router();

import { getAssist } from "../controllers/assist.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";



assistRouter.post("/", asyncHandler(authMiddleware), asyncHandler(getAssist));

export default assistRouter;