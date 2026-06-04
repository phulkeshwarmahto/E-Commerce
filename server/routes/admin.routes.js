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
  sendNotification,
  getCouponsAdmin,
  createCouponAdmin,
  deleteCouponAdmin,
  getBrandsAdmin,
  createBrandAdmin,
  deleteBrandAdmin,
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
router.post("/send-notification", asyncHandler(sendNotification));
router.get("/coupons", asyncHandler(getCouponsAdmin));
router.post("/coupons", asyncHandler(createCouponAdmin));
router.delete("/coupons/:id", asyncHandler(deleteCouponAdmin));
router.get("/brands", asyncHandler(getBrandsAdmin));
router.post("/brands", asyncHandler(createBrandAdmin));
router.delete("/brands/:id", asyncHandler(deleteBrandAdmin));

export default router;
