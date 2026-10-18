import { Quotation } from "../models/Quotation.js";
import { Booking } from "../models/Booking.js";
import { ApiError } from "../utils/ApiError.js";
import {
  createQuotationService,
  updateQuotationService,
  checkLazyExpiry,
} from "../services/quotationWorkflow.js";

export async function createQuotation(req, res) {
  const quotation = await createQuotationService(
    req.params.id,
    req.body,
    req.user,
    req.vendorProfile
  );
  res.status(201).json(quotation.toJSON());
}

export async function getQuotation(req, res) {
  const quotation = await Quotation.findById(req.params.id).populate("booking");
  if (!quotation) throw new ApiError(404, "Quotation not found");

  const booking = quotation.booking;

  // Authorization check
  if (req.user.role === "customer") {
    if (booking.user.toString() !== req.user.id || quotation.status === "draft") {
      throw new ApiError(404, "Quotation not found");
    }
  } else if (req.user.role === "vendor") {
    if (!req.vendorProfile || quotation.vendor.toString() !== req.vendorProfile._id.toString()) {
      throw new ApiError(404, "Quotation not found");
    }
  }

  await checkLazyExpiry(quotation);
  res.status(200).json(quotation.toJSON());
}

export async function updateQuotation(req, res) {
  const quotation = await updateQuotationService(
    req.params.id,
    req.body,
    req.user,
    req.vendorProfile
  );
  res.status(200).json(quotation.toJSON());
}

