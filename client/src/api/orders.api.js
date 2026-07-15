import { apiRequest } from "./axios";

export const getOrdersRequest = (page = 1, limit = 10) => apiRequest(`/orders?page=${page}&limit=${limit}`);
export const createOrderRequest = (payload) =>
  apiRequest("/orders", { method: "POST", body: payload });
export const cancelOrderRequest = (id) =>
  apiRequest(`/orders/${id}/cancel`, { method: "PATCH" });
export const getOrderByIdRequest = (id) => apiRequest(`/orders/${id}`);
