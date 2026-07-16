import { Router } from "express";
import {
  suggestProduct,
  replyQna,
  replyReview,
  suggestCampaign,
  summarizeReviews,
  draftBroadcast,
  draftUserMessage,
  draftNewsletter,
  draftSpotlight,
  suggestSiteSettings,
} from "../controllers/ai.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/suggest-product", asyncHandler(requireAuth), asyncHandler(suggestProduct));
router.post("/reply-qna", asyncHandler(optionalAuth), asyncHandler(replyQna));
router.post("/reply-review", asyncHandler(requireAuth), asyncHandler(replyReview));
router.post("/suggest-campaign", asyncHandler(requireAuth), asyncHandler(suggestCampaign));
router.post("/summarize-reviews", asyncHandler(optionalAuth), asyncHandler(summarizeReviews));
router.post("/draft-broadcast", asyncHandler(requireAuth), asyncHandler(draftBroadcast));
router.post("/draft-user-message", asyncHandler(requireAuth), asyncHandler(draftUserMessage));
router.post("/draft-newsletter", asyncHandler(requireAuth), asyncHandler(draftNewsletter));
router.post("/draft-spotlight", asyncHandler(requireAuth), asyncHandler(draftSpotlight));
router.post("/suggest-site-settings", asyncHandler(requireAuth), asyncHandler(suggestSiteSettings));

export default router;
