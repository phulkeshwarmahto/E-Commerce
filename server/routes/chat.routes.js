import { Router } from "express";
import { handleChat } from "../controllers/chat.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(optionalAuth), asyncHandler(handleChat));

export default router;
