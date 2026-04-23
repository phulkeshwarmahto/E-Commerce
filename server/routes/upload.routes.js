import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/image", requireAuth, upload, uploadImage);

export default router;
