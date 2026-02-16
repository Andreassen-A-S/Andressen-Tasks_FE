import { getAuthHeaders } from "@/helpers/helpers";
import { CreateUserInput, UpdateUserInput, User } from "@/types/users";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  const data = await res.json();
  return data.data;
}

export async function getUser(userId: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  const data = await res.json();
  return data.data;
}

export async function createUser(user: CreateUserInput): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to create user");
  const data = await res.json();
  return data.data;
}

export async function updateUser(
  userId: string,
  updates: Partial<UpdateUserInput>,
): Promise<User> {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update user");
  const data = await res.json();
  return data.data;
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete user");
}
