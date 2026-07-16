import { Router } from "express";
import { subscribeNewsletter, getSubscribers, sendNewsletter } from "../controllers/newsletter.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/subscribe", asyncHandler(subscribeNewsletter));
router.get("/", asyncHandler(requireAuth), isAdmin, asyncHandler(getSubscribers));
router.post("/send", asyncHandler(requireAuth), isAdmin, asyncHandler(sendNewsletter));

export default router;
