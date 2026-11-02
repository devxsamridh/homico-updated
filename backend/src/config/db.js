import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise;

export async function connectDB(uri = env.MONGODB_URI) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (mongoose.connection.readyState === 2 && connectionPromise) return connectionPromise;

  try {
    mongoose.set("autoIndex", env.NODE_ENV !== "production");
    connectionPromise = mongoose.connect(uri);
    await connectionPromise;
    return mongoose.connection;
  } catch (error) {
    const name = typeof error?.name === "string" ? error.name : "Error";
    const code = typeof error?.code === "string" ? ` (${error.code})` : "";
    console.error(`MongoDB connection failed (${name}${code})`);
    throw error;
  } finally {
    if (mongoose.connection.readyState !== 2) connectionPromise = undefined;
  }
}

export async function closeDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
  connectionPromise = undefined;
}
