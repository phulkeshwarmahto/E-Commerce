import { apiRequest } from "./axios";

export const getSellerDashboardRequest = () => apiRequest("/seller/dashboard");

export const getSellerFAQsRequest = () => apiRequest("/seller/faqs");

export const createSellerProductRequest = (payload) =>
  apiRequest("/seller/products", { method: "POST", body: payload });

export const updateSellerProductRequest = (id, payload) =>
  apiRequest(`/seller/products/${id}`, { method: "PUT", body: payload });

export const deleteSellerProductRequest = (id) =>
  apiRequest(`/seller/products/${id}`, { method: "DELETE" });

export const updateSellerOrderStatusRequest = (id, status, paymentStatus) =>
  apiRequest(`/seller/orders/${id}/status`, { method: "PATCH", body: { status, paymentStatus } });

export const getSellerProductsRequest = (page = 1, limit = 10) =>
  apiRequest(`/seller/products?page=${page}&limit=${limit}`);

export const getSellerOrdersRequest = (page = 1, limit = 10) =>
  apiRequest(`/seller/orders?page=${page}&limit=${limit}`);

export const getSellerSalesAnalyticsRequest = () =>
  apiRequest("/seller/analytics/sales");

export const getSellerPublicProfileRequest = (id) =>
  apiRequest(`/sellers/${id}`);

export const bulkUploadProductsRequest = (products) =>
  apiRequest("/seller/products/bulk", { method: "POST", body: { products } });

export const getSellerCouponsRequest = () =>
  apiRequest("/seller/coupons");

export const createSellerCouponRequest = (payload) =>
  apiRequest("/seller/coupons", { method: "POST", body: payload });

export const deleteSellerCouponRequest = (id) =>
  apiRequest(`/seller/coupons/${id}`, { method: "DELETE" });


