import { Router } from "express";
import { createReview, getReviews } from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { reviewValidator } from "../validators/review.validator.js";

const router = Router();

router.get("/", getReviews);
router.post("/", requireAuth, validate(reviewValidator), createReview);

export default router;
