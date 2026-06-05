import { apiRequest } from "./axios";

export const subscribeNewsletterRequest = (email) =>
  apiRequest("/newsletter/subscribe", { method: "POST", body: { email } });

export const getNewsletterSubscribersRequest = () =>
  apiRequest("/newsletter");
