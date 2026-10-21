import axios, { isAxiosError, type InternalAxiosRequestConfig } from "axios";

/** Every Flask endpoint wraps its payload in this envelope (see backend/app/utils/responses.py). */
export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message: string;
  errors?: Record<string, string[] | string> | null;
};

// Same-origin: next.config.ts rewrites /api/* to the Flask server.
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

type RefreshHandler = () => Promise<string | null>;
type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshHandler: RefreshHandler | null = null;
let refreshing: Promise<string | null> | null = null;

// The auth endpoints answer 401 for reasons a new access token can't fix.
const NO_RETRY_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"];

/** lib/auth.ts registers how to get a fresh access token (or null if the session is over). */
export function onAccessTokenExpired(handler: RefreshHandler) {
  refreshHandler = handler;
}

// On a 401, refresh the access token once (shared by every request that failed at the same time),
// then replay the original request with the new token.
api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!isAxiosError(error) || error.response?.status !== 401 || !refreshHandler) throw error;
  const config = error.config as RetryableConfig | undefined;
  if (!config || config._retried || NO_RETRY_PATHS.some((path) => config.url?.startsWith(path))) throw error;

  config._retried = true;
  refreshing ??= refreshHandler().finally(() => {
    refreshing = null;
  });
  const token = await refreshing;
  if (!token) throw error;

  config.headers.set("Authorization", `Bearer ${token}`);
  return api(config);
});

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const UNREACHABLE = "We couldn't reach Planit right now. Please check your connection and try again.";

export function toApiError(err: unknown): ApiError {
  if (!isAxiosError(err)) return new ApiError("Something went wrong. Please try again.", 0);

  const status = err.response?.status ?? 0;
  const body = err.response?.data as Partial<ApiEnvelope<unknown>> | undefined;
  if (!body || typeof body !== "object" || typeof body.message !== "string") {
    return new ApiError(UNREACHABLE, status);
  }

  const fieldErrors: Record<string, string> = {};
  for (const [field, value] of Object.entries(body.errors ?? {})) {
    fieldErrors[field] = Array.isArray(value) ? value[0] : String(value);
  }
  return new ApiError(body.message, status, fieldErrors);
}
