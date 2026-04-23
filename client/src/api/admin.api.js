import { apiRequest } from "./axios";

export const getDashboardRequest = () => apiRequest("/admin/dashboard");
export const updateOrderStatusRequest = (id, status) =>
  apiRequest(`/admin/orders/${id}`, { method: "PATCH", body: { status } });
export const createProductRequest = (payload) =>
  apiRequest("/admin/products", { method: "POST", body: payload });
export const updateProductRequest = (id, payload) =>
  apiRequest(`/admin/products/${id}`, { method: "PUT", body: payload });
