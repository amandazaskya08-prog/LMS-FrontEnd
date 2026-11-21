import type { ApiEnvelope } from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, unknown>;

  constructor(message: string, status: number, errors?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

/**
 * Thin fetch wrapper for the LMS API. Authentication is cookie-based:
 * the browser sends the HTTP-only `lms_token` cookie automatically via
 * `credentials: "include"`, so there is no token to manage in JS.
 */
export class ApiClient {
  private static buildUrl(path: string, query?: Query): string {
    const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
    if (!query) return url;
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
    });
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
  }

  static async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Query
  ): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("lms_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    let res: Response;
    try {
      res = await fetch(ApiClient.buildUrl(path, query), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      throw new ApiError("Tidak dapat terhubung ke server. Periksa koneksi Anda.", 0);
    }

    let json: Partial<ApiEnvelope<T>> | null = null;
    try {
      json = (await res.json()) as Partial<ApiEnvelope<T>>;
    } catch {
      json = null;
    }

    if (res.status === 401) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new ApiError(json?.message || "Sesi berakhir, silakan login kembali", 401);
    }

    if (!res.ok || !json || json.success === false) {
      throw new ApiError(
        json?.message || `Terjadi kesalahan (${res.status})`,
        res.status,
        json?.errors,
      );
    }
    return json.data as T;
  }

  static get<T>(path: string, query?: Query) {
    return ApiClient.request<T>("GET", path, undefined, query);
  }
  static post<T>(path: string, body?: unknown) {
    return ApiClient.request<T>("POST", path, body ?? {});
  }
  static put<T>(path: string, body?: unknown) {
    return ApiClient.request<T>("PUT", path, body ?? {});
  }
  static delete<T>(path: string) {
    return ApiClient.request<T>("DELETE", path);
  }
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Terjadi kesalahan tak terduga";
}
