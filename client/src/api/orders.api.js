import { apiRequest } from "./axios";

export const getOrdersRequest = () => apiRequest("/orders");
export const createOrderRequest = (payload) =>
  apiRequest("/orders", { method: "POST", body: payload });
