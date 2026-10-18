import { Router } from "express";
import { register, login, refresh, me } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { registerSchema, loginSchema, refreshSchema } from "../validators/authValidators.js";
import { authLimiter, refreshLimiter } from "../middleware/rateLimiters.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", authLimiter, validate({ body: registerSchema }), asyncHandler(register));
router.post("/login", authLimiter, validate({ body: loginSchema }), asyncHandler(login));
router.post("/refresh", refreshLimiter, validate({ body: refreshSchema }), asyncHandler(refresh));
router.get("/me", authenticate, asyncHandler(me));

export default router;

