import { getAuthHeaders, setAuthToken } from "@/helpers/helpers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

let _onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void) {
  _onUnauthorized = handler;
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, {
    ...init,
    headers: { ...getAuthHeaders(), ...(init?.headers as Record<string, string>) },
  });

  if (res.status !== 401) return res;

  try {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!refreshRes.ok) {
      _onUnauthorized?.();
      return res;
    }

    const { data } = await refreshRes.json();
    setAuthToken(data.token);

    // Retry original request with new token
    return fetch(input, {
      ...init,
      headers: { ...getAuthHeaders(), ...(init?.headers as Record<string, string>) },
    });
  } catch {
    _onUnauthorized?.();
    return res;
  }
}
