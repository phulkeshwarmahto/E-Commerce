import { getStoredSession } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const parseResponseBody = async (response) => {
  const contentType = response.headers.get("Content-Type") || "";
  const text = await response.text();

  if (!contentType.includes("application/json")) {
    const snippet = text.slice(0, 220).replace(/\s+/g, " ").trim();
    throw new Error(
      `Expected JSON response from ${response.url} but received HTML/text: ${snippet}`,
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON response from ${response.url}: ${error.message}`);
  }
};

const makeFetch = async (url, fetchOptions) => {
  const response = await fetch(url, fetchOptions);
  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload.data;
};

export async function apiRequest(path, options = {}) {
  const session = getStoredSession();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Authorization") && session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  const fetchOptions = {
    method: options.method || "GET",
    headers,
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
  };

  const relativeUrl = `${API_BASE_URL}${path}`;
  const directUrl = `${BACKEND_URL}${path}`;

  try {
    return await makeFetch(relativeUrl, fetchOptions);
  } catch (error) {
    if (API_BASE_URL === "/api" && !relativeUrl.startsWith("http") && directUrl) {
      try {
        return await makeFetch(directUrl, fetchOptions);
      } catch (directError) {
        throw new Error(
          `${error.message} | fallback to direct backend failed: ${directError.message}`,
        );
      }
    }

    throw error;
  }
}
