import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import bcrypt from "bcryptjs";
import { setupTestEnv, teardownTestEnv, clearCollections } from "./setup.js";
import { User } from "../src/models/User.js";
import { Vendor } from "../src/models/Vendor.js";
import { ServiceCategory } from "../src/models/ServiceCategory.js";
import { ServiceItem } from "../src/models/ServiceItem.js";
import { Booking } from "../src/models/Booking.js";
import { Quotation } from "../src/models/Quotation.js";

describe("RBAC and IDOR Security Tests", () => {
  let app;
  let customer1Token;
  let customer2Token;
  let vendor1Token;
  let vendor2Token;
  let adminToken;

  let customer1Id;
  let customer2Id;
  let vendor1Profile;
  let vendor2Profile;
  let booking1;
  let quotation1;

  before(async () => {
    const env = await setupTestEnv();
    app = env.app;
    await clearCollections();

    const hash = await bcrypt.hash("Password123", 4);

    // Create users
    const c1 = await User.create({
      full_name: "Customer 1",
      username: "cust1",
      email: "cust1@homico.test",
      password_hash: hash,
      role: "customer",
    });
    customer1Id = c1._id.toString();

    const c2 = await User.create({
      full_name: "Customer 2",
      username: "cust2",
      email: "cust2@homico.test",
      password_hash: hash,
      role: "customer",
    });
    customer2Id = c2._id.toString();

    const v1User = await User.create({
      full_name: "Vendor 1 User",
      username: "vend1",
      email: "vend1@homico.test",
      password_hash: hash,
      role: "vendor",
    });

    const v2User = await User.create({
      full_name: "Vendor 2 User",
      username: "vend2",
      email: "vend2@homico.test",
      password_hash: hash,
      role: "vendor",
    });

    const admin = await User.create({
      full_name: "Admin User",
      username: "admin_test",
      email: "admin@homico.test",
      password_hash: hash,
      role: "admin",
    });

    // Create Categories & Items
    const cat = await ServiceCategory.create({
      name: "Plumbing",
      slug: "plumbing",
    });

    const sItem = await ServiceItem.create({
      category: cat._id,
      title: "Pipe Repair",
      slug: "pipe-repair",
      is_hourly: false,
      inspection_fee: 89,
    });

    // Create Vendors
    vendor1Profile = await Vendor.create({
      user: v1User._id,
      business_name: "Vendor One Services",
      phone: "+919999999991",
      email: "vend1@homico.test",
      service_categories: [cat._id],
      city: "Bengaluru",
      pincode: "560001",
      is_verified: true,
      is_available: true,
    });

    vendor2Profile = await Vendor.create({
      user: v2User._id,
      business_name: "Vendor Two Services",
      phone: "+919999999992",
      email: "vend2@homico.test",
      service_categories: [cat._id],
      city: "Bengaluru",
      pincode: "560001",
      is_verified: true,
      is_available: true,
    });

    // Create Booking owned by Customer 1 assigned to Vendor 1
    booking1 = await Booking.create({
      user: c1._id,
      service: sItem._id,
      vendor: vendor1Profile._id,
      full_name: "Customer 1",
      phone: "+919999999999",
      address: "Address 1",
      scheduled_date: new Date(),
      time_slot: "09:00 - 11:00",
      estimated_price: 89,
      status: "inspection_completed",
    });

    // Create Draft Quotation for booking1 by Vendor 1
    quotation1 = await Quotation.create({
      booking: booking1._id,
      vendor: vendor1Profile._id,
      labor_cost: 300,
      material_cost: 200,
      total_amount: 500,
      description: "Repair quote",
      status: "draft",
    });

    // Obtain JWTs
    const login = async (email) => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email, password: "Password123" });
      return res.body.access;
    };

    customer1Token = await login("cust1@homico.test");
    customer2Token = await login("cust2@homico.test");
    vendor1Token = await login("vend1@homico.test");
    vendor2Token = await login("vend2@homico.test");
    adminToken = await login("admin@homico.test");
  });

  after(async () => {
    await teardownTestEnv();
  });

  it("Customer 2 receives 404 when attempting to read Customer 1's booking (IDOR protection)", async () => {
    const res = await request(app)
      .get(`/api/bookings/services/${booking1._id}`)
      .set("Authorization", `Bearer ${customer2Token}`);

    assert.equal(res.status, 404);
  });

  it("Customer 2 receives 404 when attempting to patch Customer 1's booking", async () => {
    const res = await request(app)
      .patch(`/api/bookings/services/${booking1._id}`)
      .set("Authorization", `Bearer ${customer2Token}`)
      .send({ status: "cancelled" });

    assert.equal(res.status, 404);
  });

  it("Customer cannot see a draft quotation (404 Not Found)", async () => {
    const res = await request(app)
      .get(`/api/bookings/quotations/${quotation1._id}`)
      .set("Authorization", `Bearer ${customer1Token}`);

    assert.equal(res.status, 404);
  });

  it("Customer calling admin routes receives 403 Forbidden", async () => {
    const res = await request(app)
      .get("/api/users/admin")
      .set("Authorization", `Bearer ${customer1Token}`);

    assert.equal(res.status, 403);
  });

  it("Vendor 2 receives 404 accessing Vendor 1's booking", async () => {
    const res = await request(app)
      .get(`/api/bookings/services/${booking1._id}`)
      .set("Authorization", `Bearer ${vendor2Token}`);

    assert.equal(res.status, 404);
  });

  it("Vendor 2 receives 404 accessing Vendor 1's quotation", async () => {
    const res = await request(app)
      .get(`/api/bookings/quotations/${quotation1._id}`)
      .set("Authorization", `Bearer ${vendor2Token}`);

    assert.equal(res.status, 404);
  });

  it("Customer cannot create vendor profiles, services, or materials (403)", async () => {
    const vRes = await request(app)
      .post("/api/vendors")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ business_name: "Hacker Vendor" });
    assert.equal(vRes.status, 403);

    const sRes = await request(app)
      .post("/api/services/categories")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ name: "Hacker Cat" });
    assert.equal(sRes.status, 403);

    const mRes = await request(app)
      .post("/api/materials")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ name: "Hacker Cement", price: 10, unit: "kg", stock: 10, category: "Test" });
    assert.equal(mRes.status, 403);
  });

  it("DELETE on bookings and orders returns 404 (cancellation is state change)", async () => {
    const bRes = await request(app)
      .delete(`/api/bookings/services/${booking1._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    assert.equal(bRes.status, 404);

    const oRes = await request(app)
      .delete(`/api/materials/orders/${booking1._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    assert.equal(oRes.status, 404);
  });
});

