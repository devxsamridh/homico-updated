import { Booking } from "../models/Booking.js";
import { Quotation } from "../models/Quotation.js";
import { ApiError } from "../utils/ApiError.js";
import { getPagination } from "../utils/pagination.js";
import {
  createBookingService,
  updateBookingStatusService,
  assignVendorService,
} from "../services/bookingWorkflow.js";

export async function listBookings(req, res) {
  const filter = {};

  if (req.user.role === "customer") {
    filter.user = req.user.id;
  } else if (req.user.role === "vendor") {
    if (!req.vendorProfile) {
      return res.status(200).json([]);
    }
    filter.vendor = req.vendorProfile._id;
  } else if (req.user.role === "admin") {
    if (req.query.status) filter.status = req.query.status;
    if (req.query.vendor) filter.vendor = req.query.vendor;
    if (req.query.user) filter.user = req.query.user;
  }

  const { isPaginated, page, limit, skip } = getPagination(req.query);

  const queryBuilder = (q) =>
    q
      .populate("service", "title is_hourly hourly_rate inspection_fee")
      .populate("vendor", "business_name city")
      .sort({ created_at: -1 });

  if (isPaginated) {
    const [count, bookings] = await Promise.all([
      Booking.countDocuments(filter),
      queryBuilder(Booking.find(filter)).skip(skip).limit(limit),
    ]);
    return res.status(200).json({
      count,
      page,
      limit,
      results: bookings.map((b) => b.toJSON()),
    });
  }

  const bookings = await queryBuilder(Booking.find(filter)).limit(limit);
  res.status(200).json(bookings.map((b) => b.toJSON()));
}

export async function createBooking(req, res) {
  const booking = await createBookingService(req.user, req.body);
  res.status(201).json(booking.toJSON());
}

export async function getBooking(req, res) {
  const filter = { _id: req.params.id };

  // IDOR Protection: Query-level scoping
  if (req.user.role === "customer") {
    filter.user = req.user.id;
  } else if (req.user.role === "vendor") {
    if (!req.vendorProfile) throw new ApiError(404, "Booking not found");
    filter.vendor = req.vendorProfile._id;
  }

  const booking = await Booking.findOne(filter)
    .populate("service", "title is_hourly hourly_rate inspection_fee")
    .populate("vendor", "business_name city");

  if (!booking) throw new ApiError(404, "Booking not found");

  // Quotations scoping
  const quotationFilter = { booking: booking._id };
  if (req.user.role === "customer") {
    quotationFilter.status = { $ne: "draft" };
  }

  const quotations = await Quotation.find(quotationFilter).sort({ created_at: -1 });
  const result = booking.toJSON();
  result.quotations = quotations.map((q) => q.toJSON());

  res.status(200).json(result);
}

export async function updateBookingStatus(req, res) {
  const filter = { _id: req.params.id };

  if (req.user.role === "customer") {
    filter.user = req.user.id;
  } else if (req.user.role === "vendor") {
    if (!req.vendorProfile) throw new ApiError(404, "Booking not found");
    filter.vendor = req.vendorProfile._id;
  }

  const booking = await Booking.findOne(filter);
  if (!booking) throw new ApiError(404, "Booking not found");

  const updated = await updateBookingStatusService(
    booking,
    req.body.status,
    req.user,
    req.vendorProfile
  );

  const populated = await Booking.findById(updated._id)
    .populate("service", "title is_hourly hourly_rate inspection_fee")
    .populate("vendor", "business_name city");

  res.status(200).json(populated.toJSON());
}

export async function assignVendor(req, res) {
  const booking = await assignVendorService(req.params.id, req.body.vendor);
  res.status(200).json(booking.toJSON());
}

