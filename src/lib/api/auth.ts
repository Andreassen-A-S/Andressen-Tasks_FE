import { LoginRequest, LoginResponse, VerifyResponse } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Auth related API functions can be added here as needed

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to login");
  }

  const response = await res.json();

  // Backend returns { success: true, data: { token, user } }
  // We need to return just { token, user }
  return response.data;
}

export async function verifyToken(token: string): Promise<VerifyResponse> {
  const res = await fetch(`${API_URL}/auth/verify`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("Verify token failed:", error);
    throw new Error(error.message || "Failed to verify token");
  }

  const response = await res.json();
  const user = response.data.user;

  return { user };
}
