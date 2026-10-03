import axios, { isAxiosError } from "axios";

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
