import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../src/app.js";
import { env } from "../src/config/env.js";

let mongodInstance = null;
let appInstance = null;

export async function setupTestEnv() {
  process.env.NODE_ENV = "test";
  process.env.BCRYPT_ROUNDS = "4";
  // `env` is parsed during ESM module loading, before this setup hook runs.
  // Keep its runtime values aligned with the test process as well.
  env.NODE_ENV = "test";
  env.BCRYPT_ROUNDS = 4;

  if (!mongodInstance) {
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);
    appInstance = createApp();
  }

  return { app: appInstance, uri: mongodInstance.getUri() };
}

export async function teardownTestEnv() {
  // Each test file has its own Node test worker. Disconnecting and stopping the
  // memory server is required so the worker can exit after its assertions run.
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongodInstance) {
    await mongodInstance.stop();
  }
  mongodInstance = null;
  appInstance = null;
}

export async function clearCollections() {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}
