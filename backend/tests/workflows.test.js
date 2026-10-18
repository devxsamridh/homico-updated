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
import { Material } from "../src/models/Material.js";
import { MaterialOrder } from "../src/models/MaterialOrder.js";

describe("Business Logic & Workflow Integration Tests", () => {
  let app;
  let customerToken;
  let vendorToken;
  let adminToken;
  let vendorProfile;
  let serviceItem;

  before(async () => {
    const env = await setupTestEnv();
    app = env.app;
    await clearCollections();

    const hash = await bcrypt.hash("Password123", 4);

    const cUser = await User.create({
      full_name: "Workflow Customer",
      username: "wf_customer",
      email: "wf_cust@homico.test",
      password_hash: hash,
      role: "customer",
    });

    const vUser = await User.create({
      full_name: "Workflow Vendor",
      username: "wf_vendor",
      email: "wf_vendor@homico.test",
      password_hash: hash,
      role: "vendor",
    });

    const aUser = await User.create({
      full_name: "Workflow Admin",
      username: "wf_admin",
      email: "wf_admin@homico.test",
      password_hash: hash,
      role: "admin",
    });

    const cat = await ServiceCategory.create({
      name: "Plumbing",
      slug: "plumbing",
    });

    serviceItem = await ServiceItem.create({
      category: cat._id,
      title: "Tap Fixing",
      slug: "tap-fixing",
      is_hourly: false,
      inspection_fee: 89,
    });

    vendorProfile = await Vendor.create({
      user: vUser._id,
      business_name: "WF Plumbing Services",
      phone: "+919999999990",
      email: "wf_vendor@homico.test",
      service_categories: [cat._id],
      city: "Bengaluru",
      pincode: "560001",
      is_verified: true,
      is_available: true,
    });

    const login = async (email) => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email, password: "Password123" });
      return res.body.access;
    };

    customerToken = await login("wf_cust@homico.test");
    vendorToken = await login("wf_vendor@homico.test");
    adminToken = await login("wf_admin@homico.test");
  });

  after(async () => {
    await teardownTestEnv();
  });

  it("server ignores client-supplied estimated_price and computes it securely", async () => {
    const res = await request(app)
      .post("/api/bookings/services")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        service: serviceItem._id.toString(),
        full_name: "Workflow Customer",
        phone: "+919876543210",
        address: "123 Main Street",
        scheduled_date: new Date().toISOString().split("T")[0],
        time_slot: "09:00 - 11:00",
        estimated_price: 1, // client attempts to spoof price to ₹1
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.estimated_price, 89); // correctly enforced server-side
  });

  it("full end-to-end booking -> quotation -> acceptance lifecycle", async () => {
    // 1. Customer creates booking
    const bRes = await request(app)
      .post("/api/bookings/services")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        service: serviceItem._id.toString(),
        full_name: "Workflow Customer",
        phone: "+919876543210",
        address: "123 Main Street",
        scheduled_date: new Date().toISOString().split("T")[0],
        time_slot: "11:00 - 13:00",
      });
    const bookingId = bRes.body.id;
    assert.equal(bRes.body.status, "pending");

    // 2. Admin assigns vendor
    const assignRes = await request(app)
      .patch(`/api/bookings/services/${bookingId}/assign`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ vendor: vendorProfile._id.toString() });
    assert.equal(assignRes.status, 200);
    assert.equal(assignRes.body.status, "vendor_assigned");

    // 3. Vendor completes inspection
    const inspectRes = await request(app)
      .patch(`/api/bookings/services/${bookingId}`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ status: "inspection_completed" });
    assert.equal(inspectRes.status, 200);
    assert.equal(inspectRes.body.status, "inspection_completed");

    // 4. Vendor creates draft quotation
    const qCreateRes = await request(app)
      .post(`/api/bookings/services/${bookingId}/quotations`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        labor_cost: 300,
        material_cost: 200,
        description: "Materials and labor",
      });
    assert.equal(qCreateRes.status, 201);
    assert.equal(qCreateRes.body.total_amount, 500);
    assert.equal(qCreateRes.body.status, "draft");
    const quotationId = qCreateRes.body.id;

    // 5. Duplicate live quotation attempt is rejected with 409
    const dupQRes = await request(app)
      .post(`/api/bookings/services/${bookingId}/quotations`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ labor_cost: 100, material_cost: 50 });
    assert.equal(dupQRes.status, 409);

    // 6. Vendor sends quotation
    const sendQRes = await request(app)
      .patch(`/api/bookings/quotations/${quotationId}`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ status: "sent", valid_days: 7 });
    assert.equal(sendQRes.status, 200);
    assert.equal(sendQRes.body.status, "sent");

    // Verify booking moved to quotation_sent
    const bCheck = await Booking.findById(bookingId);
    assert.equal(bCheck.status, "quotation_sent");

    // 7. Customer accepts quotation
    const acceptRes = await request(app)
      .patch(`/api/bookings/quotations/${quotationId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ status: "accepted" });
    assert.equal(acceptRes.status, 200);
    assert.equal(acceptRes.body.status, "accepted");

    // Verify booking moved to quotation_accepted
    const bAccepted = await Booking.findById(bookingId);
    assert.equal(bAccepted.status, "quotation_accepted");

    // 8. Vendor starts work
    const wipRes = await request(app)
      .patch(`/api/bookings/services/${bookingId}`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ status: "work_in_progress" });
    assert.equal(wipRes.status, 200);
    assert.equal(wipRes.body.status, "work_in_progress");

    // 9. Vendor completes work
    const completeRes = await request(app)
      .patch(`/api/bookings/services/${bookingId}`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ status: "completed" });
    assert.equal(completeRes.status, 200);
    assert.equal(completeRes.body.status, "completed");
  });

  it("handles lazy quotation expiry and rejects decision on expired quotation", async () => {
    // Setup booking in inspection_completed
    const b = await Booking.create({
      user: (await User.findOne({ email: "wf_cust@homico.test" }))._id,
      service: serviceItem._id,
      vendor: vendorProfile._id,
      full_name: "Workflow Customer",
      phone: "+919876543210",
      address: "123 Main Street",
      scheduled_date: new Date(),
      time_slot: "09:00 - 11:00",
      estimated_price: 89,
      status: "quotation_sent",
    });

    // Create quotation with past valid_until
    const pastDate = new Date(Date.now() - 1000 * 60 * 60);
    const q = await Quotation.create({
      booking: b._id,
      vendor: vendorProfile._id,
      labor_cost: 200,
      material_cost: 100,
      total_amount: 300,
      status: "sent",
      valid_until: pastDate,
    });

    const res = await request(app)
      .patch(`/api/bookings/quotations/${q._id}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ status: "accepted" });

    assert.equal(res.status, 409);
    assert.ok(res.body.detail.includes("expired"));

    // Verify DB persisted as expired
    const updatedQ = await Quotation.findById(q._id);
    assert.equal(updatedQ.status, "expired");
  });

  it("material order atomic stock decrement and rollback on insufficient stock", async () => {
    const mat1 = await Material.create({
      name: "Available Bricks",
      category: "Construction",
      price: 10,
      unit: "piece",
      stock: 50,
      vendor: vendorProfile._id,
    });

    const mat2 = await Material.create({
      name: "Scarce Steel",
      category: "Construction",
      price: 100,
      unit: "kg",
      stock: 5, // only 5 available
      vendor: vendorProfile._id,
    });

    // Attempt order requesting 10 bricks and 10 steel (oversell)
    const res = await request(app)
      .post("/api/materials/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        items: [
          { material: mat1._id.toString(), quantity: 10 },
          { material: mat2._id.toString(), quantity: 10 },
        ],
        delivery_address: "123 Construction Road",
      });

    assert.equal(res.status, 409);
    assert.ok(res.body.detail.includes("Insufficient stock"));

    // Verify atomic rollback: mat1 stock must still be 50
    const checkMat1 = await Material.findById(mat1._id);
    const checkMat2 = await Material.findById(mat2._id);
    assert.equal(checkMat1.stock, 50);
    assert.equal(checkMat2.stock, 5);
  });

  it("material order cancellation restores stock properly", async () => {
    const mat = await Material.create({
      name: "Cement Test",
      category: "Construction",
      price: 300,
      unit: "bag",
      stock: 20,
    });

    // Place order for 5 bags
    const oRes = await request(app)
      .post("/api/materials/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        items: [{ material: mat._id.toString(), quantity: 5 }],
        delivery_address: "123 Construction Road",
      });

    assert.equal(oRes.status, 201);
    const afterOrderMat = await Material.findById(mat._id);
    assert.equal(afterOrderMat.stock, 15);

    // Cancel order
    const cancelRes = await request(app)
      .patch(`/api/materials/orders/${oRes.body.id}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ status: "cancelled" });

    assert.equal(cancelRes.status, 200);
    assert.equal(cancelRes.body.status, "cancelled");

    // Stock must be restored to 20
    const restoredMat = await Material.findById(mat._id);
    assert.equal(restoredMat.stock, 20);
  });
});

