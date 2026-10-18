import mongoose from "mongoose";
import toJSONPlugin from "./plugins/toJSON.js";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceItem",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    pincode: {
      type: String,
      default: "",
      trim: true,
    },
    scheduled_date: {
      type: Date,
      required: true,
    },
    time_slot: {
      type: String,
      enum: ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00"],
      required: true,
    },
    problem: {
      type: String,
      default: "",
      trim: true,
    },
    estimated_price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "vendor_assigned",
        "inspection_completed",
        "quotation_sent",
        "quotation_accepted",
        "quotation_rejected",
        "work_in_progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

bookingSchema.index({ user: 1, created_at: -1 });
bookingSchema.index({ vendor: 1, created_at: -1 });
bookingSchema.index({ status: 1, created_at: -1 });
bookingSchema.index({ project: 1 });

bookingSchema.plugin(toJSONPlugin);

export const Booking = mongoose.model("Booking", bookingSchema);

