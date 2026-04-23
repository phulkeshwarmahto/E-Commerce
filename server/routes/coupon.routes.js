import { Router } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../utils/mockDb.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(new ApiResponse(true, "Coupons fetched.", { coupons: db.coupons }));
});

export default router;
