import { apiRequest } from "./axios";

export const getProductFAQsRequest = (productId) =>
  apiRequest(`/faqs?productId=${productId}`);

export const createQuestionRequest = (payload) =>
  apiRequest("/faqs", { method: "POST", body: payload });

export const answerQuestionRequest = (id, answer) =>
  apiRequest(`/faqs/${id}/answer`, { method: "PATCH", body: { answer } });
