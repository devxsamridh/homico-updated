import mongoose from "mongoose";
import toJSONPlugin from "./plugins/toJSON.js";

const quotationSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    labor_cost: {
      type: Number,
      required: true,
      min: 0,
    },
    material_cost: {
      type: Number,
      required: true,
      min: 0,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected", "expired"],
      default: "draft",
    },
    valid_until: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

quotationSchema.index({ booking: 1, status: 1 });

quotationSchema.pre("validate", function (next) {
  this.total_amount = (Number(this.labor_cost) || 0) + (Number(this.material_cost) || 0);
  next();
});

quotationSchema.plugin(toJSONPlugin);

export const Quotation = mongoose.model("Quotation", quotationSchema);

