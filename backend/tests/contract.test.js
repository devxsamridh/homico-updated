import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { setupTestEnv, teardownTestEnv, clearCollections } from "./setup.js";
import { ServiceCategory } from "../src/models/ServiceCategory.js";
import { ServiceItem } from "../src/models/ServiceItem.js";
import { Booking } from "../src/models/Booking.js";
import { Material } from "../src/models/Material.js";

describe("Frontend Compatibility Contract Tests", () => {
  let app;

  before(async () => {
    const env = await setupTestEnv();
    app = env.app;
  });

  after(async () => {
    await teardownTestEnv();
  });

  it("Rule C1 & C12 & C13: register -> login -> me round trip raw shapes", async () => {
    await clearCollections();

    // Register
    const regRes = await request(app)
      .post("/api/auth/register/")
      .send({
        email: "test_contract@homico.test",
        username: "test_contract",
        full_name: "Contract User",
        phone: "+919876543210",
        password: "Password123",
      });

    assert.equal(regRes.status, 201);
    assert.ok(regRes.body.access);
    assert.ok(regRes.body.refresh);
    assert.ok(regRes.body.user);
    assert.equal(regRes.body.user.email, "test_contract@homico.test");
    // Verify no envelope
    assert.equal(regRes.body.success, undefined);

    // Login
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test_contract@homico.test",
        password: "Password123",
      });

    assert.equal(loginRes.status, 200);
    assert.ok(loginRes.body.access);
    assert.ok(loginRes.body.refresh);
    assert.equal(loginRes.body.user.full_name, "Contract User");
    assert.equal(loginRes.body.success, undefined);

    // Me
    const meRes = await request(app)
      .get("/api/auth/me/")
      .set("Authorization", `Bearer ${loginRes.body.access}`);

    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.id, regRes.body.user.id);
    assert.equal(meRes.body.email, "test_contract@homico.test");
    assert.equal(meRes.body.full_name, "Contract User");
    assert.equal(meRes.body._id, undefined);
    assert.equal(meRes.body.__v, undefined);
    assert.equal(meRes.body.password_hash, undefined);
  });

  it("Rule C2: Error format ordering on duplicate register (first key is fieldErrors)", async () => {
    const dupRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test_contract@homico.test",
        username: "test_contract",
        full_name: "Contract User",
        password: "Password123",
      });

    assert.equal(dupRes.status, 409);
    const keys = Object.keys(dupRes.body);
    // Crucial check: First key must be a field name so Object.values(data)[0]?.[0] gets error string
    assert.ok(keys[0] === "email" || keys[0] === "username");
    assert.ok(Array.isArray(dupRes.body[keys[0]]));
    assert.equal(dupRes.body.success, false);
    assert.ok(dupRes.body.detail);
    assert.ok(dupRes.body.message);
  });

  it("Rule C5: Works with and without trailing slash", async () => {
    const withSlash = await request(app).get("/api/health/");
    const withoutSlash = await request(app).get("/api/health");
    assert.equal(withSlash.status, 200);
    assert.equal(withoutSlash.status, 200);
    assert.equal(withSlash.body.status, "ok");
    assert.equal(withoutSlash.body.status, "ok");
  });

  it("Rule C10: GET /services/categories/ returns nested items array", async () => {
    const cat = await ServiceCategory.create({
      name: "Plumbing",
      slug: "plumbing",
      description: "Plumbing repairs",
    });

    const item = await ServiceItem.create({
      category: cat._id,
      title: "Tap Repair",
      slug: "tap-repair",
      is_hourly: false,
      inspection_fee: 89,
    });

    const res = await request(app).get("/api/services/categories/");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].name, "Plumbing");
    assert.ok(Array.isArray(res.body[0].items));
    assert.equal(res.body[0].items.length, 1);
    assert.equal(res.body[0].items[0].title, "Tap Repair");
    assert.equal(res.body[0].items[0].inspection_fee, 89);
    assert.equal(res.body[0].items[0].id, item._id.toString());
    assert.equal(res.body[0].items[0]._id, undefined);
  });

  it("Rule C9: Plain array default vs paginated results object", async () => {
    await Material.create({
      name: "Bag of Cement",
      category: "Construction",
      price: 350,
      unit: "bag",
      stock: 50,
    });

    // Plain array default
    const plainRes = await request(app).get("/api/materials/");
    assert.equal(plainRes.status, 200);
    assert.ok(Array.isArray(plainRes.body));
    assert.equal(plainRes.body.length, 1);

    // Paginated
    const paginatedRes = await request(app).get("/api/materials/?page=1&limit=10");
    assert.equal(paginatedRes.status, 200);
    assert.equal(paginatedRes.body.count, 1);
    assert.equal(paginatedRes.body.page, 1);
    assert.equal(paginatedRes.body.limit, 10);
    assert.ok(Array.isArray(paginatedRes.body.results));
    assert.equal(paginatedRes.body.results.length, 1);
  });

  it("Rule C4: Document serialization includes id and strips _id, __v, password_hash", async () => {
    const res = await request(app).get("/api/materials/");
    const doc = res.body[0];
    assert.ok(typeof doc.id === "string");
    assert.equal(doc._id, undefined);
    assert.equal(doc.__v, undefined);
    assert.equal(doc.password_hash, undefined);
  });
});

