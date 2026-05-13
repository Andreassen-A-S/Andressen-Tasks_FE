import { LoginRequest, LoginResponse, VerifyResponse } from "@/types/auth";
import type { User } from "@/types/users";

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
    throw new Error(error.error || "Failed to login");
  }

  const response = await res.json();

  // Backend returns { success: true, data: { token, user } }
  // We need to return just { token, user }
  return {
    ...response.data,
    user: normalizeUser(response.data.user),
  };
}

function normalizeUser(user: User): User {
  return {
    ...user,
    position: user.position ?? "",
    organization_id: user.organization_id ?? null,
  };
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
    throw new Error(error.error || "Failed to verify token");
  }

  // Backend returns { success: true, data: { user_id, role, email, name, iat, exp } }
  // (decoded JWT payload — position/created_at/updated_at are not included)
  const { data } = await res.json();

  return {
    user: {
      user_id: data.user_id,
      email: data.email,
      role: data.role,
      name: data.name,
      position: data.position ?? "",
      organization_id: data.organization_id ?? null,
    },
  };
}
