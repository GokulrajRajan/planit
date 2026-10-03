import { useSyncExternalStore } from "react";
import { api, type ApiEnvelope } from "./api";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "reader" | "author" | "admin";
  created_at: string;
};

export type AuthState =
  | { status: "loading"; user: null }
  | { status: "anonymous"; user: null }
  | { status: "authenticated"; user: User };

type AuthPayload = { user: User; access_token: string };

const LOADING: AuthState = { status: "loading", user: null };
const ANONYMOUS: AuthState = { status: "anonymous", user: null };

// The access token is kept in memory only; the httpOnly refresh cookie restores it after a reload.
let accessToken: string | null = null;
let state: AuthState = LOADING;
let restoring: Promise<void> | null = null;
const listeners = new Set<() => void>();

api.interceptors.request.use((config) => {
  if (accessToken && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

function emit(next: AuthState) {
  state = next;
  listeners.forEach((l) => l());
}

function readCookie(name: string) {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

async function restoreSession() {
  // flask-jwt-extended sets this readable CSRF cookie alongside the refresh cookie.
  const csrf = readCookie("csrf_refresh_token");
  if (!csrf) return emit(ANONYMOUS);
  try {
    const refreshed = await api.post<ApiEnvelope<{ access_token: string }>>("/auth/refresh", null, {
      headers: { "X-CSRF-TOKEN": csrf },
    });
    accessToken = refreshed.data.data.access_token;
    const me = await api.get<ApiEnvelope<{ user: User }>>("/auth/me");
    emit({ status: "authenticated", user: me.data.data.user });
  } catch {
    accessToken = null;
    emit(ANONYMOUS);
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  restoring ??= restoreSession();
  return () => {
    listeners.delete(listener);
  };
}

export function useAuth() {
  return useSyncExternalStore(subscribe, () => state, () => LOADING);
}

function startSession({ user, access_token }: AuthPayload) {
  accessToken = access_token;
  restoring = Promise.resolve();
  emit({ status: "authenticated", user });
  return user;
}

export async function register(input: { name: string; email: string; password: string }) {
  const res = await api.post<ApiEnvelope<AuthPayload>>("/auth/register", input);
  return startSession(res.data.data);
}

export async function login(input: { email: string; password: string }) {
  const res = await api.post<ApiEnvelope<AuthPayload>>("/auth/login", input);
  return startSession(res.data.data);
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // The local session is cleared regardless; an expired token shouldn't trap the user.
  }
  accessToken = null;
  emit(ANONYMOUS);
}
