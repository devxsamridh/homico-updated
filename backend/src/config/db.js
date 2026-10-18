import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(uri = env.MONGODB_URI) {
  try {
    mongoose.set("autoIndex", env.NODE_ENV !== "production");
    await mongoose.connect(uri);
    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
}

export async function closeDB() {
  await mongoose.connection.close();
}

