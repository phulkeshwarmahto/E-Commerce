import { Router } from "express";
import { createPaymentOrder, verifyPayment, verifyUpiPayment, razorpayWebhook } from "../controllers/payment.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/create-order", asyncHandler(requireAuth), asyncHandler(createPaymentOrder));
router.post("/verify", asyncHandler(requireAuth), asyncHandler(verifyPayment));
router.post("/verify-upi", asyncHandler(requireAuth), asyncHandler(verifyUpiPayment));
router.post("/webhook", asyncHandler(razorpayWebhook));

export default router;
