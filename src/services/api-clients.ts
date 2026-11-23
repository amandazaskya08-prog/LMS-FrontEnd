/**
 * Resolves the base API URL safely.
 * Strips any trailing slashes and ensures the URL ends with /api,
 * avoiding double slashes or missing /api regardless of Vercel env settings.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) return "http://localhost:5000/api";
  const trimmed = envUrl.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export const API_URL = getApiBaseUrl();

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lms_token");
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("lms_token", token);
  } else {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
  }
}

/**
 * Universal authenticated fetch wrapper.
 * Automatically attaches Authorization: Bearer <token> AND credentials: "include"
 * to guarantee authentication works across cross-origin deployments (e.g. Vercel -> Railway)
 * even when modern browsers block third-party cookies.
 */
export function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let finalInput = input;
  if (typeof finalInput === "string") {
    // If relative path like "/ukt", prepend API_URL
    if (finalInput.startsWith("/")) {
      finalInput = `${API_URL}${finalInput}`;
    }
    // Clean up any double slashes in the path while preserving protocol
    finalInput = finalInput.replace(/(https?:\/\/)(.*)/, (_, proto, rest) => proto + rest.replace(/\/{2,}/g, "/"));
  }

  return fetch(finalInput, {
    ...init,
    credentials: "include",
    headers,
  });
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authFetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Something went wrong",
    }));

    throw new Error(error.message || "API request failed");
  }

  return response.json() as Promise<T>;
}