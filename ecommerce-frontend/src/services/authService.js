import { authApi } from "./api";

export const authService = {
  // Health Check
  healthCheck: async () => {
    const res = await authApi.get("/api/auth/health");
    return res.data;
  },

  // User Signup
  signUp: async ({ name, email, password }) => {
    const res = await authApi.post("/api/auth/signup", { name, email, password });
    return res.data;
  },

  // Confirm Signup
  confirmSignUp: async ({ email, confirmationCode }) => {
    const res = await authApi.post("/api/auth/confirm-signup", { email, confirmationCode });
    return res.data;
  },

  // Login
  login: async ({ email, password }) => {
    const res = await authApi.post("/api/auth/login", { email, password });
    return res.data;
  },

  // Admin Create User / Admin
  adminCreateUser: async ({ name, email, password, role }) => {
    const res = await authApi.post("/api/auth/admin/create-user", { name, email, password, role });
    return res.data;
  }
};
