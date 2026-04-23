import { Router } from "express";
import { getCart, updateCart } from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getCart);
router.put("/", requireAuth, updateCart);

export default router;
