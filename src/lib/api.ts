import { getAuthHeaders } from "@/helpers/helpers";
import { TaskAssignment, TaskAssignmentResponse } from "@/types/assignment";
import { LoginRequest, LoginResponse, VerifyResponse } from "@/types/auth";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";
import type { User } from "@/types/users";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return data.data;
}

export async function getTask(id: string): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch task");
  const data = await res.json();
  return data.data;
}

export async function createTask(task: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to create task");
  const data = await res.json();
  return data.data;
}

export async function updateTask(
  id: string,
  updates: Partial<UpdateTaskInput>, // Change from Partial<Task> to match your UpdateTaskInput
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update task");
  const data = await res.json();
  return data.data;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete task");
}

// User related API functions can be added here as needed

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, {
    headers: getAuthHeaders(), // Add this
  });
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  const data = await res.json();
  return data.data;
}

// Assignment related API functions can be added here as needed

export async function getTaskAssignments(
  taskId: string,
): Promise<TaskAssignment[]> {
  const response = await fetch(`${API_URL}/assignments?taskId=${taskId}`, {
    headers: getAuthHeaders(), // Add this
  });
  if (!response.ok) {
    throw new Error("Failed to fetch task assignments");
  }
  const result: TaskAssignmentResponse = await response.json();
  return result.data;
}

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
    const errorData = await res
      .json()
      .catch(() => ({ message: "Unknown error" }));

    throw new Error(errorData.message || "Failed to verify token");
  }

  const response = await res.json();
  const data = response.data;

  // Backend returns: { success: true, data: { userId, role, email, iat, exp } }
  // Transform to: { user: { user_id, role, email } }
  return {
    user: {
      user_id: data.userId,
      email: data.email,
      role: data.role,
      name: data.name,
    },
  };
}
