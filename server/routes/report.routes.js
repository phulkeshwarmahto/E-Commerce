import { Router } from "express";
import { createReport } from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(requireAuth), asyncHandler(createReport));

export default router;
