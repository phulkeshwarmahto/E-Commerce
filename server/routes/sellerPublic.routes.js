import { Router } from "express";
import { getSellerPublicProfile } from "../controllers/sellerPublic.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/:id", asyncHandler(getSellerPublicProfile));

export default router;
