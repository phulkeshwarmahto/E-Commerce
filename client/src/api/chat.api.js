import { apiRequest } from "./axios";

export const sendChatMessageRequest = (message, history = []) =>
  apiRequest("/chat", {
    method: "POST",
    body: { message, history },
  });
