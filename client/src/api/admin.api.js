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

export const sendAdminNotificationRequest = (payload) =>
  apiRequest("/admin/send-notification", { method: "POST", body: payload });
export const getAdminCouponsRequest = () =>
  apiRequest("/admin/coupons");
export const createAdminCouponRequest = (payload) =>
  apiRequest("/admin/coupons", { method: "POST", body: payload });
export const deleteAdminCouponRequest = (id) =>
  apiRequest(`/admin/coupons/${id}`, { method: "DELETE" });

export const getAdminBrandsRequest = () =>
  apiRequest("/admin/brands");
export const createAdminBrandRequest = (payload) =>
  apiRequest("/admin/brands", { method: "POST", body: payload });
export const deleteAdminBrandRequest = (id) =>
  apiRequest(`/admin/brands/${id}`, { method: "DELETE" });
