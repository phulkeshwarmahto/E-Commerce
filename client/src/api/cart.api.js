import { apiRequest } from "./axios";

export const getCartRequest = () => apiRequest("/cart");
export const updateCartRequest = (items) =>
  apiRequest("/cart", { method: "PUT", body: { items } });
