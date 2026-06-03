import { Router } from "express";
import {
  createProduct,
  getDashboard,
  updateOrderStatus,
  updateProduct,
  getUsers,
  updateUserCreditScore,
  updateUserCertification,
  updateUserRole,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { productValidator } from "../validators/product.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(asyncHandler(requireAuth), isAdmin);
router.get("/dashboard", asyncHandler(getDashboard));
router.patch("/orders/:id", asyncHandler(updateOrderStatus));
router.post("/products", validate(productValidator), asyncHandler(createProduct));
router.put("/products/:id", validate(productValidator), asyncHandler(updateProduct));
router.get("/users", asyncHandler(getUsers));
router.patch("/users/:id/credit-score", asyncHandler(updateUserCreditScore));
router.patch("/users/:id/certification", asyncHandler(updateUserCertification));
router.patch("/users/:id/role", asyncHandler(updateUserRole));

export default router;
