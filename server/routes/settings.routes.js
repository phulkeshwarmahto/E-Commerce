import { Router } from "express";
import { getSettings } from "../controllers/settings.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getSettings));

export default router;
