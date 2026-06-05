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
  broadcastNotification,
  getCouponsAdmin,
  createCouponAdmin,
  deleteCouponAdmin,
  getBrandsAdmin,
  createBrandAdmin,
  deleteBrandAdmin,
  banUser,
  unbanUser,
  getReports,
  resolveReport,
  getSalesAnalytics,
  getPendingReviews,
  approveReview,
  rejectReview,
  exportAdminSalesCSV,
  getGeoAnalytics,
  deleteProductAdmin,
  getSettingsAdmin,
  updateSettingsAdmin,
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
router.delete("/products/:id", asyncHandler(deleteProductAdmin));
router.get("/settings", asyncHandler(getSettingsAdmin));
router.put("/settings", asyncHandler(updateSettingsAdmin));
router.get("/users", asyncHandler(getUsers));
router.patch("/users/:id/credit-score", asyncHandler(updateUserCreditScore));
router.patch("/users/:id/certification", asyncHandler(updateUserCertification));
router.patch("/users/:id/role", asyncHandler(updateUserRole));
router.patch("/users/:id/ban", asyncHandler(banUser));
router.patch("/users/:id/unban", asyncHandler(unbanUser));
router.post("/send-notification", asyncHandler(sendNotification));
router.post("/broadcast-notification", asyncHandler(broadcastNotification));
router.get("/coupons", asyncHandler(getCouponsAdmin));
router.post("/coupons", asyncHandler(createCouponAdmin));
router.delete("/coupons/:id", asyncHandler(deleteCouponAdmin));
router.get("/brands", asyncHandler(getBrandsAdmin));
router.post("/brands", asyncHandler(createBrandAdmin));
router.delete("/brands/:id", asyncHandler(deleteBrandAdmin));
router.get("/reports", asyncHandler(getReports));
router.patch("/reports/:id/resolve", asyncHandler(resolveReport));
router.get("/analytics/sales", asyncHandler(getSalesAnalytics));
router.get("/analytics/export", asyncHandler(exportAdminSalesCSV));
router.get("/analytics/geo", asyncHandler(getGeoAnalytics));
router.get("/reviews/pending", asyncHandler(getPendingReviews));
router.patch("/reviews/:id/approve", asyncHandler(approveReview));
router.delete("/reviews/:id/reject", asyncHandler(rejectReview));

export default router;
