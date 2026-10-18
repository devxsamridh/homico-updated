import { Quotation } from "../models/Quotation.js";
import { Booking } from "../models/Booking.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Checks lazy expiry for a quotation. If expired, updates DB and sets status to expired.
 */
export async function checkLazyExpiry(quotation) {
  if (quotation.status === "sent" && quotation.valid_until && new Date() > quotation.valid_until) {
    quotation.status = "expired";
    await quotation.save();
    return true;
  }
  return quotation.status === "expired";
}

export async function createQuotationService(bookingId, data, user, vendorProfile) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (!booking.vendor) {
    throw new ApiError(400, "Booking does not have an assigned vendor");
  }

  // Authorization: must be the assigned vendor or admin
  if (user.role === "vendor") {
    if (!vendorProfile || booking.vendor.toString() !== vendorProfile._id.toString()) {
      throw new ApiError(403, "You are not the assigned vendor for this booking");
    }
  }

  // Booking state check: inspection_completed, quotation_rejected, or quotation_sent (if previous expired)
  if (!["inspection_completed", "quotation_rejected", "quotation_sent"].includes(booking.status)) {
    throw new ApiError(409, `Cannot create quotation when booking is in '${booking.status}'`);
  }

  // Check no LIVE quotation exists: draft, sent & unexpired, or accepted
  const existingQuotations = await Quotation.find({
    booking: booking._id,
    status: { $in: ["draft", "sent", "accepted"] },
  });

  const now = new Date();
  for (const q of existingQuotations) {
    if (q.status === "draft" || q.status === "accepted") {
      throw new ApiError(409, "A live quotation already exists for this booking");
    }
    if (q.status === "sent") {
      if (q.valid_until && q.valid_until < now) {
        q.status = "expired";
        await q.save();
      } else {
        throw new ApiError(409, "An active sent quotation already exists for this booking");
      }
    }
  }

  const quotation = await Quotation.create({
    booking: booking._id,
    vendor: booking.vendor,
    labor_cost: data.labor_cost,
    material_cost: data.material_cost,
    description: data.description || "",
    status: "draft",
    valid_until: null,
  });

  return quotation;
}

export async function updateQuotationService(quotationId, data, user, vendorProfile) {
  const quotation = await Quotation.findById(quotationId).populate("booking");
  if (!quotation) throw new ApiError(404, "Quotation not found");

  const booking = quotation.booking;

  // Handle Customer decision
  if (user.role === "customer") {
    if (booking.user.toString() !== user.id) {
      throw new ApiError(404, "Quotation not found");
    }

    if (quotation.status === "draft") {
      // Drafts are invisible to customers
      throw new ApiError(404, "Quotation not found");
    }

    // Lazy expiry check
    const isExpired = await checkLazyExpiry(quotation);
    if (isExpired) {
      throw new ApiError(409, "Quotation has expired");
    }

    if (!data.status || !["accepted", "rejected"].includes(data.status)) {
      throw new ApiError(400, "Customers can only set status to 'accepted' or 'rejected'");
    }

    // Atomic conditional update to prevent race conditions on double decisions
    const updated = await Quotation.findOneAndUpdate(
      { _id: quotation._id, status: "sent" },
      { status: data.status },
      { new: true }
    );

    if (!updated) {
      throw new ApiError(409, "Quotation is no longer in sent status or already decided");
    }

    booking.status = data.status === "accepted" ? "quotation_accepted" : "quotation_rejected";
    await booking.save();

    return updated;
  }

  // Handle Vendor / Admin actions
  const isAdmin = user.role === "admin";
  const isAssignedVendor =
    user.role === "vendor" &&
    vendorProfile &&
    quotation.vendor.toString() === vendorProfile._id.toString();

  if (!isAdmin && !isAssignedVendor) {
    throw new ApiError(403, "You do not have permission to modify this quotation");
  }

  // Check lazy expiry on current
  await checkLazyExpiry(quotation);

  if (quotation.status !== "draft" && data.status !== "accepted" && data.status !== "rejected") {
    // Only drafts can be modified or sent
    throw new ApiError(409, "Sent or decided quotations are immutable");
  }

  if (data.status === "sent") {
    const validDays = data.valid_days || 7;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    quotation.status = "sent";
    quotation.valid_until = validUntil;

    if (data.labor_cost !== undefined) quotation.labor_cost = data.labor_cost;
    if (data.material_cost !== undefined) quotation.material_cost = data.material_cost;
    if (data.description !== undefined) quotation.description = data.description;

    await quotation.save();

    // Advance booking status
    booking.status = "quotation_sent";
    await booking.save();

    return quotation;
  }

  // Draft updates
  if (data.labor_cost !== undefined) quotation.labor_cost = data.labor_cost;
  if (data.material_cost !== undefined) quotation.material_cost = data.material_cost;
  if (data.description !== undefined) quotation.description = data.description;

  await quotation.save();
  return quotation;
}

