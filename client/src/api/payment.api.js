import { apiRequest } from "./axios";

export const createPaymentOrderRequest = (orderId) =>
  apiRequest("/payment/create-order", { method: "POST", body: { orderId } });

export const verifyPaymentRequest = (payload) =>
  apiRequest("/payment/verify", { method: "POST", body: payload });

export const verifyUpiPaymentRequest = (orderId) =>
  apiRequest("/payment/verify-upi", { method: "POST", body: { orderId } });
