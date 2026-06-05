import { Router } from "express";
import {
  login,
  me,
  register,
  googleLogin,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  sendEmailVerification,
  verifyEmail,
  deleteAccount,
  uploadAvatar,
  exportUserData
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/register", authRateLimiter, validate(registerValidator), asyncHandler(register));
router.post("/login", authRateLimiter, validate(loginValidator), asyncHandler(login));
router.post("/google-login", authRateLimiter, asyncHandler(googleLogin));
router.get("/me", asyncHandler(requireAuth), me);
router.put("/profile", asyncHandler(requireAuth), asyncHandler(updateProfile));
router.post("/forgot-password", authRateLimiter, asyncHandler(forgotPassword));
router.post("/reset-password", authRateLimiter, asyncHandler(resetPassword));

// New Phase 2 routes
router.put("/change-password", asyncHandler(requireAuth), asyncHandler(changePassword));
router.post("/send-verification", asyncHandler(requireAuth), asyncHandler(sendEmailVerification));
router.post("/verify-email", asyncHandler(verifyEmail));
router.delete("/delete-account", asyncHandler(requireAuth), asyncHandler(deleteAccount));

// New Phase 3 routes
router.post("/avatar", asyncHandler(requireAuth), upload, asyncHandler(uploadAvatar));
router.get("/me/export", asyncHandler(requireAuth), asyncHandler(exportUserData));

export default router;
