import { Router } from "express";
import {
  getSellerDashboard,
  getSellerFAQs,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  updateSellerOrderStatus,
} from "../controllers/seller.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { isSeller } from "../middleware/seller.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { productValidator } from "../validators/product.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(asyncHandler(requireAuth), isSeller);

router.get("/dashboard", asyncHandler(getSellerDashboard));
router.get("/faqs", asyncHandler(getSellerFAQs));
router.post("/products", validate(productValidator), asyncHandler(createSellerProduct));
router.put("/products/:id", validate(productValidator), asyncHandler(updateSellerProduct));
router.delete("/products/:id", asyncHandler(deleteSellerProduct));
router.patch("/orders/:id/status", asyncHandler(updateSellerOrderStatus));

export default router;
