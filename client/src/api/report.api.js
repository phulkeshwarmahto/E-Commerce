import { apiRequest } from "./axios";

export const createReportRequest = (payload) =>
  apiRequest("/reports", { method: "POST", body: payload });
