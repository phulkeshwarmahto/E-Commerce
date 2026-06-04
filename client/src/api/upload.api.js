import { apiRequest } from "./axios";

export const uploadImageRequest = (formData) =>
  apiRequest("/upload/image", { method: "POST", body: formData });

export const uploadImagesRequest = (formData) =>
  apiRequest("/upload/images", { method: "POST", body: formData });
