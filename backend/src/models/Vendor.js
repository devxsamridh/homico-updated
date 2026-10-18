import mongoose from "mongoose";
import toJSONPlugin from "./plugins/toJSON.js";

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    business_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    service_categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceCategory",
      },
    ],
    city: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    is_available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

vendorSchema.index({ is_verified: 1, city: 1 });
vendorSchema.index({ service_categories: 1 });

vendorSchema.plugin(toJSONPlugin);

export const Vendor = mongoose.model("Vendor", vendorSchema);

