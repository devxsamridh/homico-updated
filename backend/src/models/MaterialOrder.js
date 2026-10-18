import mongoose from "mongoose";
import toJSONPlugin from "./plugins/toJSON.js";

const orderItemSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const materialOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    items: [orderItemSchema],
    delivery_address: {
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
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

materialOrderSchema.index({ user: 1, created_at: -1 });
materialOrderSchema.index({ status: 1, created_at: -1 });
materialOrderSchema.index({ "items.vendor": 1, created_at: -1 });
materialOrderSchema.index({ project: 1 });

materialOrderSchema.plugin(toJSONPlugin);

export const MaterialOrder = mongoose.model("MaterialOrder", materialOrderSchema);

