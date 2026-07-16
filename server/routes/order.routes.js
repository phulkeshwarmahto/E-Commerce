import { Router } from "express";
import { createOrder, getOrders, cancelOrder, getOrderById } from "../controllers/order.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { orderValidator } from "../validators/order.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(requireAuth), asyncHandler(getOrders));
router.post("/", asyncHandler(optionalAuth), validate(orderValidator), asyncHandler(createOrder));
router.get("/:id", asyncHandler(optionalAuth), asyncHandler(getOrderById));
router.patch("/:id/cancel", asyncHandler(optionalAuth), asyncHandler(cancelOrder));

export default router;
