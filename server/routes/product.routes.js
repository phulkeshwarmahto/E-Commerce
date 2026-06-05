import { Router } from "express";
import { getProductById, getProducts, notifyMeStock } from "../controllers/product.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(optionalAuth), asyncHandler(getProducts));
router.get("/:id", asyncHandler(optionalAuth), asyncHandler(getProductById));
router.post("/:id/notify-me", asyncHandler(requireAuth), asyncHandler(notifyMeStock));

export default router;
