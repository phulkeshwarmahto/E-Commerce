import { Router } from "express";
import { getWishlist, toggleWishlistItem } from "../controllers/wishlist.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.get("/", asyncHandler(getWishlist));
router.post("/toggle", asyncHandler(toggleWishlistItem));

export default router;
