import { apiRequest } from "./axios";

export const getWishlistRequest = () =>
  apiRequest("/wishlist");

export const toggleWishlistRequest = (productId) =>
  apiRequest("/wishlist/toggle", { method: "POST", body: { productId } });
