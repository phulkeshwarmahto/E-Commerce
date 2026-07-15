import { Router } from "express";
import { createOrder, getOrders, cancelOrder, getOrderById } from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { orderValidator } from "../validators/order.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(requireAuth), asyncHandler(getOrders));
router.post("/", asyncHandler(requireAuth), validate(orderValidator), asyncHandler(createOrder));
router.get("/:id", asyncHandler(requireAuth), asyncHandler(getOrderById));
router.patch("/:id/cancel", asyncHandler(requireAuth), asyncHandler(cancelOrder));

export default router;
