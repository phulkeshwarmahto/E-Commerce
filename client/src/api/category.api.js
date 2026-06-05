import { apiRequest } from "./axios";

export const getCategoriesRequest = () => apiRequest("/categories");

export const createCategoryRequest = (payload) =>
  apiRequest("/categories", { method: "POST", body: payload });

export const updateCategoryRequest = (id, payload) =>
  apiRequest(`/categories/${id}`, { method: "PATCH", body: payload });

export const deleteCategoryRequest = (id) =>
  apiRequest(`/categories/${id}`, { method: "DELETE" });
