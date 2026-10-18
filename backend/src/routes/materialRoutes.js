import { Router } from "express";
import {
  listMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../controllers/materialController.js";
import { authenticate, loadVendorProfile } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validate, validateObjectId } from "../middleware/validationMiddleware.js";
import {
  materialSchema,
  updateMaterialSchema,
} from "../validators/materialValidators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const catalogCache = (req, res, next) => {
  res.set("Cache-Control", "public, max-age=60");
  next();
};

// Optional auth helper: if token provided on list query, authenticate to enable `mine=true`
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authenticate(req, res, (err) => {
      if (err) return next(); // Ignore auth failure on public listing
      loadVendorProfile(req, res, next);
    });
  }
  next();
};

// Public catalog routes (Rule C8)
router.get("/", catalogCache, optionalAuth, asyncHandler(listMaterials));
router.get("/:id", catalogCache, validateObjectId("id"), asyncHandler(getMaterial));

// Vendor / Admin management routes
router.post(
  "/",
  authenticate,
  loadVendorProfile,
  requireRole("vendor", "admin"),
  validate({ body: materialSchema }),
  asyncHandler(createMaterial)
);

router.patch(
  "/:id",
  authenticate,
  loadVendorProfile,
  requireRole("vendor", "admin"),
  validateObjectId("id"),
  validate({ body: updateMaterialSchema }),
  asyncHandler(updateMaterial)
);

router.delete(
  "/:id",
  authenticate,
  loadVendorProfile,
  requireRole("vendor", "admin"),
  validateObjectId("id"),
  asyncHandler(deleteMaterial)
);

export default router;

