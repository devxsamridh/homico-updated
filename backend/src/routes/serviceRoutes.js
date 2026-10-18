import { Router } from "express";
import {
  listCategories,
  getCategoryBySlug,
  listItems,
  createCategory,
  updateCategory,
  deleteCategory,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
} from "../controllers/serviceController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validate, validateObjectId } from "../middleware/validationMiddleware.js";
import {
  categorySchema,
  updateCategorySchema,
  serviceItemSchema,
  updateServiceItemSchema,
} from "../validators/serviceValidators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Middleware setting cache headers for public catalog routes
const catalogCache = (req, res, next) => {
  res.set("Cache-Control", "public, max-age=60");
  next();
};

// Public catalog routes (Rule C8: do not inspect authorization header)
router.get("/categories", catalogCache, asyncHandler(listCategories));
router.get("/categories/:slug", catalogCache, asyncHandler(getCategoryBySlug));
router.get("/items", catalogCache, asyncHandler(listItems));

// Admin CRUD routes
router.post("/categories", authenticate, requireRole("admin"), validate({ body: categorySchema }), asyncHandler(createCategory));
router.patch("/categories/:id", authenticate, requireRole("admin"), validateObjectId("id"), validate({ body: updateCategorySchema }), asyncHandler(updateCategory));
router.delete("/categories/:id", authenticate, requireRole("admin"), validateObjectId("id"), asyncHandler(deleteCategory));

router.post("/items", authenticate, requireRole("admin"), validate({ body: serviceItemSchema }), asyncHandler(createServiceItem));
router.patch("/items/:id", authenticate, requireRole("admin"), validateObjectId("id"), validate({ body: updateServiceItemSchema }), asyncHandler(updateServiceItem));
router.delete("/items/:id", authenticate, requireRole("admin"), validateObjectId("id"), asyncHandler(deleteServiceItem));

export default router;

