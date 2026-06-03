import { apiRequest } from "./axios";

export const getCouponsRequest = () => apiRequest("/coupons");
