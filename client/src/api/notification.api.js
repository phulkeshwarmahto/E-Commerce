import { apiRequest } from "./axios";

export const getNotificationsRequest = () => apiRequest("/notifications");
export const markNotificationReadRequest = (id) =>
  apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
export const markAllNotificationsReadRequest = () =>
  apiRequest("/notifications/mark-all-read", { method: "POST" });
