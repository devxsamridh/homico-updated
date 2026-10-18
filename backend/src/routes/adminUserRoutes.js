import { Router } from "express";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
} from "../controllers/adminUserController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validate, validateObjectId } from "../middleware/validationMiddleware.js";
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
} from "../validators/authValidators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/", asyncHandler(listUsers));
router.get("/:id", validateObjectId("id"), asyncHandler(getUser));
router.post("/", validate({ body: adminCreateUserSchema }), asyncHandler(createUser));
router.patch("/:id", validateObjectId("id"), validate({ body: adminUpdateUserSchema }), asyncHandler(updateUser));

export default router;

