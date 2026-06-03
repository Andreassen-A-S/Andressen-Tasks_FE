import { LoginRequest, LoginResponse, ActiveSession } from "@/types/auth";
import { normalizeUser } from "./userNormalizer";
import { apiFetch } from "./apiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include", // receives httpOnly session_id cookie
    headers: { "Content-Type": "application/json", "X-Client": "browser" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to login");
  }

  const response = await res.json();
  return {
    token: response.data.token,
    user: normalizeUser(response.data.user),
    savedAccounts: (response.data.savedAccounts ?? []).map(normalizeUser),
  };
}

// Startup session restore: uses the httpOnly session_id cookie
export async function refreshSession(): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Session expired");
  const response = await res.json();
  return {
    token: response.data.token,
    user: normalizeUser(response.data.user),
    savedAccounts: (response.data.savedAccounts ?? []).map(normalizeUser),
  };
}

// Returns all active sessions (browser + mobile) for the current user
export async function getSessions(): Promise<ActiveSession[]> {
  const res = await apiFetch(`${API_URL}/auth/sessions`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch sessions");
  const response = await res.json();
  return response.data;
}

export async function revokeAllSessions(): Promise<void> {
  const res = await apiFetch(`${API_URL}/auth/sessions/all`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to revoke all sessions");
}

export async function revokeSession(id: string, type: "browser" | "mobile"): Promise<void> {
  const segment = type === "browser" ? "browser" : "mobile";
  const res = await apiFetch(`${API_URL}/auth/sessions/${segment}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to revoke session");
}

// Switch to another account within the same browser session
export async function switchAccount(userId: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/switch-account`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error("Failed to switch account");
  const response = await res.json();
  return {
    token: response.data.token,
    user: normalizeUser(response.data.user),
    savedAccounts: (response.data.savedAccounts ?? []).map(normalizeUser),
  };
}
