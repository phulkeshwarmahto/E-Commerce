import { Router } from "express";
import { createSupportTicket, getSupportTickets, resolveSupportTicket } from "../controllers/support.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(optionalAuth), asyncHandler(createSupportTicket));
router.get("/", asyncHandler(requireAuth), isAdmin, asyncHandler(getSupportTickets));
router.patch("/:id/resolve", asyncHandler(requireAuth), isAdmin, asyncHandler(resolveSupportTicket));

export default router;
