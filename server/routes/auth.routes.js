import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerValidator), register);
router.post("/login", validate(loginValidator), login);
router.get("/me", requireAuth, me);

export default router;
