import { apiRequest } from "./axios";

export const getSettingsRequest = () => apiRequest("/settings");
