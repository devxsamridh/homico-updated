import { api } from "./client.js";

export const vendorsApi = {
  list: (params) => api.get("/vendors/", { params }).then((r) => r.data),
  get: (id) => api.get(`/vendors/${id}/`).then((r) => r.data),
};
