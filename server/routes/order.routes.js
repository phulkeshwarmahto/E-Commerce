import { Router } from "express";
import { createOrder, getOrders } from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { orderValidator } from "../validators/order.validator.js";

const router = Router();

router.get("/", requireAuth, getOrders);
router.post("/", requireAuth, validate(orderValidator), createOrder);

export default router;
