import { Router } from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.get("/", asyncHandler(getNotifications));
router.patch("/:id/read", asyncHandler(markAsRead));
router.post("/mark-all-read", asyncHandler(markAllAsRead));

export default router;
