import { api } from "./client.js";

export const materialsApi = {
  list: (params) => api.get("/materials/", { params }).then((r) => r.data),
  createOrder: (payload) => api.post("/materials/orders/", payload).then((r) => r.data),
  listOrders: () => api.get("/materials/orders/").then((r) => r.data),
};
