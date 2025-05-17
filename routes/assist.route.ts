import { Router } from "express";
const assistRouter = Router();

import { getAssist } from "../controllers/assist.controller.js";
import asyncHandler from "../utils/asyncHandler.js";


assistRouter.post("/",  asyncHandler(getAssist));

export default assistRouter;