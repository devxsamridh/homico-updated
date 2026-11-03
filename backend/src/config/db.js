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
    const code = typeof error?.code === "string" ? error.code : undefined;
    const syscall = typeof error?.syscall === "string" ? error.syscall : undefined;
    const hostname = typeof error?.hostname === "string" ? error.hostname : undefined;
    const details = [
      code ? `code: ${code}` : "",
      syscall ? `syscall: ${syscall}` : "",
      hostname ? `hostname: ${hostname}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    const errorDetails = details ? ` (${details})` : "";
    const causeMsg = error?.cause?.message ? ` | Cause: ${error.cause.message}` : "";
    console.error(`MongoDB connection failed: [${name}] ${error?.message || "Unknown error"}${errorDetails}${causeMsg}`);
    throw error;
  } finally {
    if (mongoose.connection.readyState !== 2) connectionPromise = undefined;
  }
}

export async function closeDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
  connectionPromise = undefined;
}
