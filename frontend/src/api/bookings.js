import { api } from "./client.js";

export const bookingsApi = {
  list: () => api.get("/bookings/services/").then((r) => r.data),
  create: (payload) => api.post("/bookings/services/", payload).then((r) => r.data),
  get: (id) => api.get(`/bookings/services/${id}/`).then((r) => r.data),
  decideQuotation: (id, status) =>
    api.patch(`/bookings/quotations/${id}/`, { status }).then((r) => r.data),
};
