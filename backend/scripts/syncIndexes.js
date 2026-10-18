import mongoose from "mongoose";
import { connectDB, closeDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { Vendor } from "../src/models/Vendor.js";
import { ServiceCategory } from "../src/models/ServiceCategory.js";
import { ServiceItem } from "../src/models/ServiceItem.js";
import { Booking } from "../src/models/Booking.js";
import { Quotation } from "../src/models/Quotation.js";
import { Material } from "../src/models/Material.js";
import { MaterialOrder } from "../src/models/MaterialOrder.js";
import { Project } from "../src/models/Project.js";

async function syncAllIndexes() {
  await connectDB();
  console.log("Synchronizing all Mongoose indexes...");

  const models = [
    User,
    Vendor,
    ServiceCategory,
    ServiceItem,
    Booking,
    Quotation,
    Material,
    MaterialOrder,
    Project,
  ];

  for (const model of models) {
    console.log(`Syncing indexes for ${model.modelName}...`);
    await model.syncIndexes();
  }

  console.log("✅ All indexes synchronized successfully.");
  await closeDB();
}

syncAllIndexes().catch((err) => {
  console.error("Index sync failed:", err);
  process.exit(1);
});

