import { apiRequest } from "./axios";

export const getProductsRequest = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== false) {
      searchParams.set(key, value);
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiRequest(`/products${suffix}`);
};

export const getProductRequest = (id) => apiRequest(`/products/${id}`);
