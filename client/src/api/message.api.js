import { apiRequest } from "./axios";

export const getOrderMessagesRequest = (orderId) =>
  apiRequest(`/messages/${orderId}`);

export const sendMessageRequest = (orderId, text, recipient) =>
  apiRequest("/messages", {
    method: "POST",
    body: { orderId, text, recipient },
  });
