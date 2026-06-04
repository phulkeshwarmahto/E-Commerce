import { apiRequest } from "./axios";

export const loginRequest = (payload) => apiRequest("/auth/login", { method: "POST", body: payload });
export const registerRequest = (payload) =>
  apiRequest("/auth/register", { method: "POST", body: payload });
export const googleLoginRequest = (payload) =>
  apiRequest("/auth/google-login", { method: "POST", body: payload });
export const meRequest = () => apiRequest("/auth/me");
export const updateProfileRequest = (payload) =>
  apiRequest("/auth/profile", { method: "PUT", body: payload });
