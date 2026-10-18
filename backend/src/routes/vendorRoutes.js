import { Router } from "express";
import {
  listVendors,
  getVendor,
  createVendor,
  updateVendor,
} from "../controllers/vendorController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validate, validateObjectId } from "../middleware/validationMiddleware.js";
import {
  createVendorSchema,
  updateVendorSchema,
} from "../validators/vendorValidators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listVendors));
router.get("/:id", validateObjectId("id"), asyncHandler(getVendor));
router.post("/", requireRole("admin"), validate({ body: createVendorSchema }), asyncHandler(createVendor));
router.patch("/:id", validateObjectId("id"), validate({ body: updateVendorSchema }), asyncHandler(updateVendor));

export default router;

