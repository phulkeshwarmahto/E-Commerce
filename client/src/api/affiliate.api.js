import { apiRequest } from "./axios";

export const trackAffiliateClickRequest = (productId, email, phone) => {
  return apiRequest("/affiliate/track-click", {
    method: "POST",
    body: { productId, email, phone },
  });
};
