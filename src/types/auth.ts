import type { User } from "./users";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  savedAccounts: User[];
}

export interface ActiveSession {
  id: string;
  type: "browser" | "mobile";
  current: boolean;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  label?: string;
  location?: string;
}
