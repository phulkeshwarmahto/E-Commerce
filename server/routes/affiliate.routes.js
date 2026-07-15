import { Router } from "express";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { trackClick } from "../controllers/affiliate.controller.js";

const router = Router();

router.post("/track-click", optionalAuth, trackClick);

export default router;
