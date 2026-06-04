import { Router } from "express";
import { uploadImage, uploadImages } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { upload, uploadMultiple } from "../middleware/upload.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/image", asyncHandler(requireAuth), upload, asyncHandler(uploadImage));
router.post("/images", asyncHandler(requireAuth), uploadMultiple, asyncHandler(uploadImages));

export default router;

