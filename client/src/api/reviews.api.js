import { apiRequest } from "./axios";

export const getReviewsRequest = (productId) => apiRequest(`/reviews?productId=${productId}`);
export const createReviewRequest = (payload) =>
  apiRequest("/reviews", { method: "POST", body: payload });
