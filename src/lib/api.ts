import { getAuthStore } from "@/store/auth.store";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiInit = Omit<RequestInit, "body"> & { body?: unknown };

// Never attempt token refresh for these paths — a 401 here means bad credentials,
// not an expired session.
const NO_REFRESH_PREFIXES = ["/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh"];

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const { refreshToken, setAccessToken, clearAuth } = getAuthStore();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) {
      clearAuth();
      return null;
    }

    const json = await res.json();
    const { accessToken, expiresIn } = json.data ?? json;
    setAccessToken(accessToken, expiresIn);
    return accessToken as string;
  } catch {
    clearAuth();
    return null;
  }
}

async function getToken(): Promise<string | null> {
  return getAuthStore().accessToken;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: ApiInit = {},
): Promise<T> {
  const { body, ...rest } = init;

  const buildHeaders = (token: string | null) => {
    const h = new Headers(rest.headers as HeadersInit);
    h.set("Content-Type", "application/json");
    if (token) h.set("Authorization", `Bearer ${token}`);
    return h;
  };

  const makeRequest = (token: string | null) =>
    fetch(`${BASE}${path}`, {
      ...rest,
      cache: "no-store",
      headers: buildHeaders(token),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  const token = await getToken();
  let res = await makeRequest(token);

  // Token expired — try to refresh once, but skip for auth endpoints
  if (res.status === 401 && !NO_REFRESH_PREFIXES.some((p) => path.startsWith(p))) {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (!newToken) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please log in again.");
    }

    res = await makeRequest(newToken);
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    // Backend error shape: { success: false, error: { message, code } }
    const message =
      errBody?.error?.message ?? errBody?.message ?? `Request failed (${res.status})`;
    const code = errBody?.error?.code ?? "UNKNOWN";
    throw new ApiError(message, res.status, code);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: "GET" }),

  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body }),

  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body }),

  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PUT", body }),

  delete: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "DELETE", body }),
};

// ── Typed response wrapper ────────────────────────────────────────────────────
// Backend always returns { success, data, message } or { success, data, pagination }
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  // Backend sends pagination under "meta" (mirrors backend SuccessBody shape)
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
