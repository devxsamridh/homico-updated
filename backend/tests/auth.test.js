import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import { env } from "../src/config/env.js";
import { setupTestEnv, teardownTestEnv, clearCollections } from "./setup.js";
import { User } from "../src/models/User.js";

describe("Authentication & Security Tests", () => {
  let app;

  before(async () => {
    const env = await setupTestEnv();
    app = env.app;
  });

  after(async () => {
    await teardownTestEnv();
  });

  it("public registration strips/ignores role escalation to admin", async () => {
    await clearCollections();

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "hacker@homico.test",
        username: "hacker_user",
        full_name: "Hacker",
        password: "Password123",
        role: "admin", // attempt escalation
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.user.role, "customer");

    const saved = await User.findById(res.body.user.id);
    assert.equal(saved.role, "customer");
  });

  it("returns identical 401 response for unknown email and wrong password", async () => {
    const unknownRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@homico.test",
        password: "Password123",
      });

    const wrongPassRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "hacker@homico.test",
        password: "WrongPassword123",
      });

    assert.equal(unknownRes.status, 401);
    assert.equal(wrongPassRes.status, 401);
    assert.equal(unknownRes.body.detail, "Invalid credentials");
    assert.equal(wrongPassRes.body.detail, "Invalid credentials");
  });

  it("refresh token returns new access token without rotating refresh token", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "hacker@homico.test",
        password: "Password123",
      });

    const refreshToken = loginRes.body.refresh;

    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .send({ refresh: refreshToken });

    assert.equal(refreshRes.status, 200);
    assert.ok(refreshRes.body.access);
    assert.equal(refreshRes.body.refresh, undefined); // No refresh token returned (Rule C13)
  });

  it("rejects access token presented to refresh endpoint with 401", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "hacker@homico.test",
        password: "Password123",
      });

    const accessToken = loginRes.body.access;

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refresh: accessToken });

    assert.equal(res.status, 401);
  });

  it("rejects expired access token with 401 (triggers frontend refresh)", async () => {
    const user = await User.findOne({ email: "hacker@homico.test" });

    // Sign an expired access token using the loaded env config
    const expiredToken = jwt.sign(
      { userId: user._id.toString(), role: user.role, type: "access" },
      env.JWT_ACCESS_SECRET,
      { algorithm: "HS256", expiresIn: "-10s" }
    );

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    assert.equal(res.status, 401);
    assert.equal(res.body.detail, "Token expired");
  });

  it("rejects deactivated user token with 401 immediately", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "hacker@homico.test",
        password: "Password123",
      });

    const token = loginRes.body.access;

    // Deactivate user in DB
    await User.updateOne({ email: "hacker@homico.test" }, { is_active: false });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(res.status, 401);
  });

  it("rejects tampered token with 401", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.jwt.signature");

    assert.equal(res.status, 401);
  });
});

