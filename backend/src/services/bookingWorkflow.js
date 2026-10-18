import { Booking } from "../models/Booking.js";
import { ServiceItem } from "../models/ServiceItem.js";
import { Vendor } from "../models/Vendor.js";
import { Project } from "../models/Project.js";
import { Quotation } from "../models/Quotation.js";
import { ApiError } from "../utils/ApiError.js";
import { BOOKING_TRANSITIONS, canTransition } from "../utils/transitions.js";

export async function createBookingService(user, data) {
  // 1. Service item exists and is active
  const service = await ServiceItem.findById(data.service);
  if (!service || !service.is_active) {
    throw new ApiError(404, "Service item not found or inactive");
  }

  // 2. Compute estimated price strictly server-side
  const estimated_price = service.is_hourly ? service.hourly_rate : service.inspection_fee;

  // 3. Project check if supplied
  if (data.project) {
    const project = await Project.findOne({ _id: data.project, owner: user.id });
    if (!project) {
      throw new ApiError(404, "Project not found or not owned by user");
    }
  }

  const scheduled_date = new Date(`${data.scheduled_date}T00:00:00.000Z`);

  const booking = await Booking.create({
    user: user.id,
    service: service._id,
    vendor: null,
    project: data.project || null,
    full_name: data.full_name,
    phone: data.phone,
    address: data.address,
    city: data.city || "",
    pincode: data.pincode || "",
    scheduled_date,
    time_slot: data.time_slot,
    problem: data.problem || "",
    estimated_price,
    status: "pending",
  });

  return Booking.findById(booking._id)
    .populate("service", "title is_hourly hourly_rate inspection_fee")
    .populate("vendor", "business_name city");
}

export async function updateBookingStatusService(booking, targetStatus, user, vendorProfile) {
  const currentStatus = booking.status;

  // Special statuses restricted from generic PATCH
  if (["vendor_assigned", "quotation_sent", "quotation_accepted", "quotation_rejected"].includes(targetStatus)) {
    throw new ApiError(403, `Status '${targetStatus}' cannot be set directly via this endpoint`);
  }

  // Check state machine transition
  if (!canTransition(BOOKING_TRANSITIONS, currentStatus, targetStatus)) {
    throw new ApiError(409, `Cannot transition booking from '${currentStatus}' to '${targetStatus}'`);
  }

  // Check role authorization for this specific transition
  if (user.role === "customer") {
    if (targetStatus === "cancelled" && ["pending", "confirmed", "vendor_assigned"].includes(currentStatus)) {
      booking.status = "cancelled";
      await booking.save();
      return booking;
    }
    throw new ApiError(403, "Customers can only cancel bookings before inspection has begun");
  }

  if (user.role === "vendor") {
    const allowed =
      (currentStatus === "vendor_assigned" && targetStatus === "inspection_completed") ||
      (currentStatus === "quotation_accepted" && targetStatus === "work_in_progress") ||
      (currentStatus === "work_in_progress" && targetStatus === "completed");

    if (allowed) {
      booking.status = targetStatus;
      await booking.save();
      return booking;
    }
    throw new ApiError(403, `Vendors cannot transition booking from '${currentStatus}' to '${targetStatus}'`);
  }

  if (user.role === "admin") {
    booking.status = targetStatus;
    await booking.save();
    return booking;
  }

  throw new ApiError(403, "Unauthorized transition attempt");
}

export async function assignVendorService(bookingId, vendorId) {
  const booking = await Booking.findById(bookingId).populate("service");
  if (!booking) throw new ApiError(404, "Booking not found");

  if (!["pending", "confirmed"].includes(booking.status)) {
    throw new ApiError(409, `Cannot assign vendor to booking in status '${booking.status}'`);
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor || !vendor.is_verified || !vendor.is_available) {
    throw new ApiError(400, "Vendor is not available or not verified");
  }

  // Check vendor covers service category
  const serviceCategory = booking.service?.category;
  const covers = vendor.service_categories.some(
    (catId) => catId.toString() === serviceCategory.toString()
  );

  if (!covers) {
    throw new ApiError(400, "Vendor does not support this service category");
  }

  booking.vendor = vendor._id;
  booking.status = "vendor_assigned";
  await booking.save();

  return Booking.findById(booking._id)
    .populate("service", "title is_hourly hourly_rate inspection_fee")
    .populate("vendor", "business_name city");
}

