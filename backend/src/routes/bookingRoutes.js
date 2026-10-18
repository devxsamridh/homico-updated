import { Router } from "express";
import {
  listBookings,
  createBooking,
  getBooking,
  updateBookingStatus,
  assignVendor,
} from "../controllers/bookingController.js";
import {
  createQuotation,
  getQuotation,
  updateQuotation,
} from "../controllers/quotationController.js";
import { authenticate, loadVendorProfile } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validate, validateObjectId } from "../middleware/validationMiddleware.js";
import {
  createBookingSchema,
  updateBookingStatusSchema,
  assignVendorSchema,
} from "../validators/bookingValidators.js";
import {
  createQuotationSchema,
  updateQuotationSchema,
} from "../validators/quotationValidators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate, loadVendorProfile);

// Bookings
router.get("/services", asyncHandler(listBookings));
router.post("/services", requireRole("customer"), validate({ body: createBookingSchema }), asyncHandler(createBooking));
router.get("/services/:id", validateObjectId("id"), asyncHandler(getBooking));
router.patch("/services/:id", validateObjectId("id"), validate({ body: updateBookingStatusSchema }), asyncHandler(updateBookingStatus));
router.patch("/services/:id/assign", requireRole("admin"), validateObjectId("id"), validate({ body: assignVendorSchema }), asyncHandler(assignVendor));

// Quotations nested under booking
router.post("/services/:id/quotations", requireRole("vendor", "admin"), validateObjectId("id"), validate({ body: createQuotationSchema }), asyncHandler(createQuotation));

// Quotations direct routes
router.get("/quotations/:id", validateObjectId("id"), asyncHandler(getQuotation));
router.patch("/quotations/:id", validateObjectId("id"), validate({ body: updateQuotationSchema }), asyncHandler(updateQuotation));

export default router;

