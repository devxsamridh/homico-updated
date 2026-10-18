import mongoose from "mongoose";
import toJSONPlugin from "./plugins/toJSON.js";

const serviceItemSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    is_hourly: {
      type: Boolean,
      default: false,
    },
    hourly_rate: {
      type: Number,
      default: 0,
      min: 0,
    },
    inspection_fee: {
      type: Number,
      default: 89,
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

serviceItemSchema.index({ category: 1, is_active: 1 });

serviceItemSchema.pre("validate", function (next) {
  if (this.is_hourly && (!this.hourly_rate || this.hourly_rate <= 0)) {
    this.invalidate("hourly_rate", "Hourly rate must be greater than 0 for hourly services");
  }
  next();
});

serviceItemSchema.plugin(toJSONPlugin);

export const ServiceItem = mongoose.model("ServiceItem", serviceItemSchema);

