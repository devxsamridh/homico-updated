import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { env } from "../src/config/env.js";

describe("health endpoints", () => {
  it("serves liveness without requiring a MongoDB connection", async () => {
    const app = createApp();

    const rootHealth = await request(app).get("/health");
    const apiLiveness = await request(app).get("/api/health/live");

    assert.equal(rootHealth.status, 200);
    assert.deepEqual(rootHealth.body, { status: "ok" });
    assert.equal(apiLiveness.status, 200);
    assert.deepEqual(apiLiveness.body, { status: "ok" });
  });

  it("reports database unavailability from the readiness endpoint", async () => {
    env.MONGODB_URI = "mongodb://127.0.0.1:1/homico_test?serverSelectionTimeoutMS=100";

    const response = await request(createApp()).get("/api/health");

    assert.equal(response.status, 503);
    assert.equal(response.body.detail, "Database unavailable");
  });
});
