export const BOOKING_TRANSITIONS = {
  pending: ["confirmed", "vendor_assigned", "cancelled"],
  confirmed: ["vendor_assigned", "cancelled"],
  vendor_assigned: ["inspection_completed", "cancelled"],
  inspection_completed: ["quotation_sent", "cancelled"],
  quotation_sent: ["quotation_accepted", "quotation_rejected", "cancelled"],
  quotation_rejected: ["quotation_sent", "cancelled"],
  quotation_accepted: ["work_in_progress", "cancelled"],
  work_in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const QUOTATION_TRANSITIONS = {
  draft: ["sent"],
  sent: ["accepted", "rejected", "expired"],
  accepted: [],
  rejected: [],
  expired: [],
};

export const ORDER_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

export const PROJECT_TRANSITIONS = {
  planning: ["quotation", "cancelled"],
  quotation: ["approved", "planning", "cancelled"],
  approved: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canTransition(map, current, next) {
  if (!map[current]) return false;
  return map[current].includes(next);
}

