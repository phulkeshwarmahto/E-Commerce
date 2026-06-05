import { apiRequest } from "./axios";

export const createReturnRequest = (payload) =>
  apiRequest("/returns", { method: "POST", body: payload });

export const getReturnRequests = (page = 1, limit = 10) =>
  apiRequest(`/returns?page=${page}&limit=${limit}`);

export const updateReturnRequestStatus = (id, status) =>
  apiRequest(`/returns/${id}/status`, { method: "PATCH", body: { status } });
