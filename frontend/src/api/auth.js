import { api } from "./client.js";

/** Auth-related API calls. Tokens are persisted by AuthContext. */
export const authApi = {
  register: (payload) => api.post("/auth/register/", payload).then((r) => r.data),
  login: (credentials) => api.post("/auth/login/", credentials).then((r) => r.data),
  me: () => api.get("/auth/me/").then((r) => r.data),
};
