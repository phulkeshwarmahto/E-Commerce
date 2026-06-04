import { apiRequest } from "./axios";

export const getBrandsRequest = () => apiRequest("/brands");
