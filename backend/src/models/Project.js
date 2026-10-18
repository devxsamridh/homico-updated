import mongoose from "mongoose";
import toJSONPlugin from "./plugins/toJSON.js";

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    site_address: {
      type: String,
      required: true,
      trim: true,
    },
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
    status: {
      type: String,
      enum: ["planning", "quotation", "approved", "in_progress", "completed", "cancelled"],
      default: "planning",
    },
    start_date: {
      type: Date,
      required: true,
    },
    estimated_end_date: {
      type: Date,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

projectSchema.pre("validate", function (next) {
  if (this.start_date && this.estimated_end_date && this.estimated_end_date < this.start_date) {
    this.invalidate("estimated_end_date", "Estimated end date must be on or after start date");
  }
  next();
});

projectSchema.index({ owner: 1, created_at: -1 });

projectSchema.plugin(toJSONPlugin);

export const Project = mongoose.model("Project", projectSchema);

