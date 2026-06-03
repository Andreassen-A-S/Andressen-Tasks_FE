import { apiFetch } from "./apiClient";
import { CreateUserInput, UpdateUserInput, User } from "@/types/users";
import { normalizeUser } from "./userNormalizer";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getUsers(): Promise<User[]> {
  const res = await apiFetch(`${API_URL}/users`);
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  const data = await res.json();
  return data.data.map(normalizeUser);
}

export async function getUser(userId: string): Promise<User> {
  const res = await apiFetch(`${API_URL}/users/${userId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  const data = await res.json();
  return normalizeUser(data.data);
}

export async function createUser(user: CreateUserInput): Promise<User> {
  const res = await apiFetch(`${API_URL}/users`, {
    method: "POST",
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to create user");
  const data = await res.json();
  return normalizeUser(data.data);
}

export async function updateUser(
  userId: string,
  updates: Partial<UpdateUserInput>,
): Promise<User> {
  const res = await apiFetch(`${API_URL}/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update user");
  const data = await res.json();
  return normalizeUser(data.data);
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/users/${userId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete user");
}

export async function prepareProfilePicture(userId: string, mimeType: string, fileSize: number): Promise<{ upload_url: string; public_url: string }> {
  const res = await apiFetch(`${API_URL}/users/${userId}/profile-picture/prepare`, {
    method: "POST",
    body: JSON.stringify({ mime_type: mimeType, file_size: fileSize }),
  });
  if (!res.ok) throw new Error("Failed to prepare profile picture upload");
  const data = await res.json();
  return data.data;
}
