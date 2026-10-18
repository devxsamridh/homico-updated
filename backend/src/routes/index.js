import { Router } from "express";
import mongoose from "mongoose";
import authRoutes from "./authRoutes.js";
import adminUserRoutes from "./adminUserRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import vendorRoutes from "./vendorRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import materialRoutes from "./materialRoutes.js";
import orderRoutes from "./orderRoutes.js";
import projectRoutes from "./projectRoutes.js";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    status: "ok",
    db: dbStatus,
    uptime: process.uptime(),
  });
});

// Resource routers
router.use("/auth", authRoutes);
router.use("/users/admin", adminUserRoutes);
router.use("/services", serviceRoutes);
router.use("/vendors", vendorRoutes);
router.use("/bookings", bookingRoutes);

// CRITICAL MOUNT ORDER: Mount /materials/orders before /materials
router.use("/materials/orders", orderRoutes);
router.use("/materials", materialRoutes);

router.use("/projects", projectRoutes);

export default router;

