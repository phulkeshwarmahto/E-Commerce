import { apiRequest } from "./axios";

export const uploadImageRequest = (formData) =>
  apiRequest("/upload/image", { method: "POST", body: formData });
