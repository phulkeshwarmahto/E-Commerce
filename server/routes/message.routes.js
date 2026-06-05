import { Router } from "express";
import { sendMessage, getOrderMessages } from "../controllers/message.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.post("/", asyncHandler(sendMessage));
router.get("/:orderId", asyncHandler(getOrderMessages));

export default router;
