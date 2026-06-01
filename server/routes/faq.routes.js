import { Router } from "express";
import {
  getProductFAQs,
  createQuestion,
  answerQuestion,
} from "../controllers/faq.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getProductFAQs));
router.post("/", asyncHandler(requireAuth), asyncHandler(createQuestion));
router.patch("/:id/answer", asyncHandler(requireAuth), asyncHandler(answerQuestion));

export default router;
