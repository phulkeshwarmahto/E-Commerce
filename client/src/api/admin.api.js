import { apiRequest } from "./axios";

export const getDashboardRequest = () => apiRequest("/admin/dashboard");
export const updateOrderStatusRequest = (id, status) =>
  apiRequest(`/admin/orders/${id}`, { method: "PATCH", body: { status } });
export const createProductRequest = (payload) =>
  apiRequest("/admin/products", { method: "POST", body: payload });
export const updateProductRequest = (id, payload) =>
  apiRequest(`/admin/products/${id}`, { method: "PUT", body: payload });

export const getUsersRequest = () => apiRequest("/admin/users");
export const updateUserCreditScoreRequest = (id, score) =>
  apiRequest(`/admin/users/${id}/credit-score`, { method: "PATCH", body: { score } });
export const updateUserCertificationRequest = (id, certificationStatus) =>
  apiRequest(`/admin/users/${id}/certification`, { method: "PATCH", body: { certificationStatus } });
export const updateUserRoleRequest = (id, role) =>
  apiRequest(`/admin/users/${id}/role`, { method: "PATCH", body: { role } });
