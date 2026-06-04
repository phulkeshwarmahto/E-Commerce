import { Router } from "express";
import { getBrands } from "../controllers/brand.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getBrands));

export default router;
