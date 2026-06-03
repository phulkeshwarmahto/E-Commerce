import { apiRequest } from "./axios";

export const getSellerDashboardRequest = () => apiRequest("/seller/dashboard");

export const getSellerFAQsRequest = () => apiRequest("/seller/faqs");

export const createSellerProductRequest = (payload) =>
  apiRequest("/seller/products", { method: "POST", body: payload });

export const updateSellerProductRequest = (id, payload) =>
  apiRequest(`/seller/products/${id}`, { method: "PUT", body: payload });

export const deleteSellerProductRequest = (id) =>
  apiRequest(`/seller/products/${id}`, { method: "DELETE" });

export const updateSellerOrderStatusRequest = (id, status) =>
  apiRequest(`/seller/orders/${id}/status`, { method: "PATCH", body: { status } });
