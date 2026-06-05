import { Router } from "express";
import { createReturnRequest, getReturnRequests, updateReturnRequestStatus } from "../controllers/return.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(requireAuth), asyncHandler(createReturnRequest));
router.get("/", asyncHandler(requireAuth), asyncHandler(getReturnRequests));
router.patch("/:id/status", asyncHandler(requireAuth), asyncHandler(updateReturnRequestStatus));

export default router;
