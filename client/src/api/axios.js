import { getStoredSession } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function apiRequest(path, options = {}) {
  const session = getStoredSession();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Authorization") && session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload.data;
}
