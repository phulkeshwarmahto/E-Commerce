import { apiRequest } from "./axios";

export const getDashboardRequest = () => apiRequest("/admin/dashboard");
export const updateOrderStatusRequest = (id, status, paymentStatus) =>
  apiRequest(`/admin/orders/${id}`, { method: "PATCH", body: { status, paymentStatus } });
export const createProductRequest = (payload) =>
  apiRequest("/admin/products", { method: "POST", body: payload });
export const updateProductRequest = (id, payload) =>
  apiRequest(`/admin/products/${id}`, { method: "PUT", body: payload });

export const getUsersRequest = (page = 1, limit = 10, role = "", certificationStatus = "") => {
  let query = `/admin/users?page=${page}&limit=${limit}`;
  if (role) query += `&role=${role}`;
  if (certificationStatus) query += `&certificationStatus=${certificationStatus}`;
  return apiRequest(query);
};
export const banUserRequest = (id) => apiRequest(`/admin/users/${id}/ban`, { method: "PATCH" });
export const unbanUserRequest = (id) => apiRequest(`/admin/users/${id}/unban`, { method: "PATCH" });

export const getAdminReportsRequest = (page = 1, limit = 10) => apiRequest(`/admin/reports?page=${page}&limit=${limit}`);
export const resolveReportRequest = (id, action) =>
  apiRequest(`/admin/reports/${id}/resolve`, { method: "PATCH", body: { action } });

export const getAdminSalesAnalyticsRequest = () => apiRequest("/admin/analytics/sales");

export const updateUserCreditScoreRequest = (id, score) =>
  apiRequest(`/admin/users/${id}/credit-score`, { method: "PATCH", body: { score } });
export const updateUserCertificationRequest = (id, certificationStatus) =>
  apiRequest(`/admin/users/${id}/certification`, { method: "PATCH", body: { certificationStatus } });
export const updateUserRoleRequest = (id, role) =>
  apiRequest(`/admin/users/${id}/role`, { method: "PATCH", body: { role } });

export const sendAdminNotificationRequest = (payload) =>
  apiRequest("/admin/send-notification", { method: "POST", body: payload });
export const broadcastNotificationRequest = (payload) =>
  apiRequest("/admin/broadcast-notification", { method: "POST", body: payload });
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

export const getPendingReviewsRequest = (page = 1, limit = 10) =>
  apiRequest(`/admin/reviews/pending?page=${page}&limit=${limit}`);
export const approveReviewRequest = (id) =>
  apiRequest(`/admin/reviews/${id}/approve`, { method: "PATCH" });
export const rejectReviewRequest = (id) =>
  apiRequest(`/admin/reviews/${id}/reject`, { method: "DELETE" });

export const getAdminGeoAnalyticsRequest = () =>
  apiRequest("/admin/analytics/geo");
