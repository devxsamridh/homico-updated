import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { setupTestEnv, teardownTestEnv, clearCollections } from "./setup.js";
import { User } from "../src/models/User.js";

describe("Validation and Injection Security Tests", () => {
  let app;
  let userToken;

  before(async () => {
    const env = await setupTestEnv();
    app = env.app;
    await clearCollections();

    const reg = await request(app)
      .post("/api/auth/register")
      .send({
        email: "validate@homico.test",
        username: "validate_user",
        full_name: "Validate User",
        password: "Password123",
      });
    userToken = reg.body.access;
  });

  after(async () => {
    await teardownTestEnv();
  });

  it("rejects invalid ObjectId format with 400", async () => {
    const res = await request(app)
      .get("/api/bookings/services/123-invalid-id")
      .set("Authorization", `Bearer ${userToken}`);

    assert.equal(res.status, 400);
    assert.ok(res.body.detail.includes("Invalid"));
  });

  it("rejects 12-character non-hex string which mongoose.isValidObjectId wrongly accepts", async () => {
    const res = await request(app)
      .get("/api/bookings/services/12charsstring")
      .set("Authorization", `Bearer ${userToken}`);

    assert.equal(res.status, 400);
  });

  it("rejects malformed JSON body with 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ invalid json");

    assert.equal(res.status, 400);
  });

  it("rejects NoSQL injection operator in login body with 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: { $ne: null },
        password: "Password123",
      });

    assert.equal(res.status, 400);
  });

  it("strips unknown fields to protect against mass assignment", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "stripped@homico.test",
        username: "stripped_user",
        full_name: "Stripped User",
        password: "Password123",
        is_active: false,
        is_admin: true,
      });

    assert.equal(res.status, 201);
    const user = await User.findById(res.body.user.id);
    assert.equal(user.is_active, true);
    assert.equal(user.is_admin, undefined);
  });
});

