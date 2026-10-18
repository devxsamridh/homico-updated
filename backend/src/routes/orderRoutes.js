import { Router } from "express";
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authenticate, loadVendorProfile } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validate, validateObjectId } from "../middleware/validationMiddleware.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/materialValidators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate, loadVendorProfile);

router.get("/", asyncHandler(listOrders));
router.post("/", requireRole("customer"), validate({ body: createOrderSchema }), asyncHandler(createOrder));
router.get("/:id", validateObjectId("id"), asyncHandler(getOrder));
router.patch("/:id", validateObjectId("id"), validate({ body: updateOrderStatusSchema }), asyncHandler(updateOrderStatus));

export default router;

