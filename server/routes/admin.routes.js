import { Router } from "express";
import {
  createProduct,
  getDashboard,
  updateOrderStatus,
  updateProduct,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { productValidator } from "../validators/product.validator.js";

const router = Router();

router.use(requireAuth, isAdmin);
router.get("/dashboard", getDashboard);
router.patch("/orders/:id", updateOrderStatus);
router.post("/products", validate(productValidator), createProduct);
router.put("/products/:id", validate(productValidator), updateProduct);

export default router;
