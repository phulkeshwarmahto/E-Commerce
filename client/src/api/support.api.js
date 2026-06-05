import { apiRequest } from "./axios";

export const createSupportTicketRequest = (payload) =>
  apiRequest("/support", { method: "POST", body: payload });

export const getSupportTicketsRequest = (page = 1, limit = 10) =>
  apiRequest(`/support?page=${page}&limit=${limit}`);

export const resolveSupportTicketRequest = (id) =>
  apiRequest(`/support/${id}/resolve`, { method: "PATCH" });
