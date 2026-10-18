import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BOOKING_TRANSITIONS,
  QUOTATION_TRANSITIONS,
  ORDER_TRANSITIONS,
  PROJECT_TRANSITIONS,
  canTransition,
} from "../src/utils/transitions.js";

describe("State Transitions Unit Tests", () => {
  it("allows valid booking transitions", () => {
    assert.equal(canTransition(BOOKING_TRANSITIONS, "pending", "confirmed"), true);
    assert.equal(canTransition(BOOKING_TRANSITIONS, "pending", "cancelled"), true);
    assert.equal(canTransition(BOOKING_TRANSITIONS, "vendor_assigned", "inspection_completed"), true);
    assert.equal(canTransition(BOOKING_TRANSITIONS, "quotation_accepted", "work_in_progress"), true);
    assert.equal(canTransition(BOOKING_TRANSITIONS, "work_in_progress", "completed"), true);
  });

  it("rejects invalid booking transitions", () => {
    assert.equal(canTransition(BOOKING_TRANSITIONS, "pending", "completed"), false);
    assert.equal(canTransition(BOOKING_TRANSITIONS, "completed", "pending"), false);
    assert.equal(canTransition(BOOKING_TRANSITIONS, "cancelled", "confirmed"), false);
  });

  it("validates quotation transitions", () => {
    assert.equal(canTransition(QUOTATION_TRANSITIONS, "draft", "sent"), true);
    assert.equal(canTransition(QUOTATION_TRANSITIONS, "sent", "accepted"), true);
    assert.equal(canTransition(QUOTATION_TRANSITIONS, "sent", "rejected"), true);
    assert.equal(canTransition(QUOTATION_TRANSITIONS, "sent", "expired"), true);
    assert.equal(canTransition(QUOTATION_TRANSITIONS, "draft", "accepted"), false);
    assert.equal(canTransition(QUOTATION_TRANSITIONS, "accepted", "draft"), false);
  });

  it("validates order transitions", () => {
    assert.equal(canTransition(ORDER_TRANSITIONS, "pending", "confirmed"), true);
    assert.equal(canTransition(ORDER_TRANSITIONS, "confirmed", "processing"), true);
    assert.equal(canTransition(ORDER_TRANSITIONS, "processing", "out_for_delivery"), true);
    assert.equal(canTransition(ORDER_TRANSITIONS, "out_for_delivery", "delivered"), true);
    assert.equal(canTransition(ORDER_TRANSITIONS, "delivered", "cancelled"), false);
  });

  it("validates project transitions", () => {
    assert.equal(canTransition(PROJECT_TRANSITIONS, "planning", "quotation"), true);
    assert.equal(canTransition(PROJECT_TRANSITIONS, "quotation", "approved"), true);
    assert.equal(canTransition(PROJECT_TRANSITIONS, "approved", "in_progress"), true);
    assert.equal(canTransition(PROJECT_TRANSITIONS, "in_progress", "completed"), true);
    assert.equal(canTransition(PROJECT_TRANSITIONS, "completed", "planning"), false);
  });
});

