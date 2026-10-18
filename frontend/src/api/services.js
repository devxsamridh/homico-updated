import { api } from "./client.js";

export const servicesApi = {
  listCategories: () => api.get("/services/categories/").then((r) => r.data),
  getCategory: (slug) => api.get(`/services/categories/${slug}/`).then((r) => r.data),
  listItems: (params) => api.get("/services/items/", { params }).then((r) => r.data),
};
