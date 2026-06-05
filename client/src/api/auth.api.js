import { apiRequest } from "./axios";

export const loginRequest = (payload) => apiRequest("/auth/login", { method: "POST", body: payload });
export const registerRequest = (payload) =>
  apiRequest("/auth/register", { method: "POST", body: payload });
export const googleLoginRequest = (payload) =>
  apiRequest("/auth/google-login", { method: "POST", body: payload });
export const meRequest = () => apiRequest("/auth/me");
export const updateProfileRequest = (payload) =>
  apiRequest("/auth/profile", { method: "PUT", body: payload });
export const forgotPasswordRequest = (payload) =>
  apiRequest("/auth/forgot-password", { method: "POST", body: payload });
export const resetPasswordRequest = (payload) =>
  apiRequest("/auth/reset-password", { method: "POST", body: payload });

export const changePasswordRequest = (payload) =>
  apiRequest("/auth/change-password", { method: "PUT", body: payload });
export const sendVerificationRequest = () =>
  apiRequest("/auth/send-verification", { method: "POST" });
export const verifyEmailRequest = (payload) =>
  apiRequest("/auth/verify-email", { method: "POST", body: payload });
export const deleteAccountRequest = () =>
  apiRequest("/auth/delete-account", { method: "DELETE" });

export const getAddressesRequest = () => apiRequest("/auth/addresses");
export const addAddressRequest = (payload) => apiRequest("/auth/addresses", { method: "POST", body: payload });
export const updateAddressRequest = (addressId, payload) => apiRequest(`/auth/addresses/${addressId}`, { method: "PUT", body: payload });
export const deleteAddressRequest = (addressId) => apiRequest(`/auth/addresses/${addressId}`, { method: "DELETE" });

