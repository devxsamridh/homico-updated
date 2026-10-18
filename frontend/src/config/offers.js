/**
 * Offer modal content — editable single source of truth.
 * Must reflect only real product features. No coupon codes or fake discounts.
 */
export const OFFER = {
  headline: "Transparent Pricing — Always",
  body: "Your inspection visit is a flat ₹89. After the visit, you receive a detailed, itemised quotation for labour and materials — no hidden charges, no surprises.",
  cta: "Book an Inspection",
  ctaHref: "/services",
  /** Show only once per 24 hours. Key used in localStorage. */
  storageKey: "homico.offer.seen",
  ttlMs: 24 * 60 * 60 * 1000, // 24 h
};

