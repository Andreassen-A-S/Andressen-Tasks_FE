import { getAuthHeaders } from "@/helpers/helpers";
import { TaskAssignment, TaskAssignmentResponse } from "@/types/assignment";
import { LoginRequest, LoginResponse, VerifyResponse } from "@/types/auth";
import type {
  Task,
  CreateTaskInput,
  CreateSubtaskInput,
  UpdateTaskInput,
  TaskUnit,
} from "@/types/task";
import type { User } from "@/types/users";
import {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/types/comment";
import { CreateTaskEventInput, TaskEvent } from "@/types/taskEvent";
import {
  CreateRecurringTemplateInput,
  RecurringTemplate,
} from "@/types/recuringTemplate";

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

export async function createSubtask(task: CreateSubtaskInput): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/subtasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to create subtask");
  const data = await res.json();
  return data.data;
}

export interface AddTaskProgressInput {
  quantity_done: number;
  unit?: TaskUnit;
  note?: string;
}

export async function addTaskProgress(
  taskId: string,
  payload: AddTaskProgressInput,
): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${taskId}/progress`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to add task progress");
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

// Assignment related API functions can be added here as needed

export async function getTaskAssignments(
  taskId: string,
): Promise<TaskAssignment[]> {
  const response = await fetch(`${API_URL}/assignments?taskId=${taskId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch task assignments");
  }
  const result: TaskAssignmentResponse = await response.json();
  return result.data;
}

export async function getUserAssignments(
  userId: string,
): Promise<TaskAssignment[]> {
  const response = await fetch(`${API_URL}/assignments?userId=${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user assignments");
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
    const error = await res.json();
    console.error("Verify token failed:", error);
    throw new Error(error.message || "Failed to verify token");
  }

  const response = await res.json();
  const data = response.data;

  // Transform to expected format
  const result = {
    user: {
      user_id: data.user_id,
      email: data.email,
      role: data.role,
      name: data.name,
    },
  };
  return result;
}

// Comment API functions
export async function getTaskComments(taskId: string): Promise<Comment[]> {
  const response = await fetch(`${API_URL}/comments/task/${taskId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }

  const result = await response.json();
  return result.data;
}

export async function createComment(
  taskId: string,
  data: CreateCommentRequest,
): Promise<Comment> {
  const response = await fetch(`${API_URL}/comments/task/${taskId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  const result = await response.json();
  return result.data;
}

export async function updateComment(
  commentId: string,
  data: UpdateCommentRequest,
): Promise<Comment> {
  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update comment");
  }

  const result = await response.json();
  return result.data;
}

export async function deleteComment(commentId: string): Promise<void> {
  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete comment");
  }
}

// Event logging API function can be added here as needed

export async function getTaskEvents(taskId: string): Promise<TaskEvent[]> {
  const res = await fetch(`${API_URL}/task-events/${taskId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch task events");
  const data = await res.json();
  return data.data;
}

export async function createTaskEvent(
  taskEvent: CreateTaskEventInput,
): Promise<TaskEvent> {
  const res = await fetch(`${API_URL}/task-events`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(taskEvent),
  });
  if (!res.ok) throw new Error("Failed to create task event");
  const data = await res.json();
  return data.data;
}

// Recurring template API functions

/**
 * Get all recurring templates
 */
export async function getRecurringTemplates(): Promise<RecurringTemplate[]> {
  const res = await fetch(`${API_URL}/recurring-templates`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch recurring templates");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Get a single recurring template by ID
 */
export async function getRecurringTemplate(
  templateId: string,
): Promise<RecurringTemplate> {
  const res = await fetch(`${API_URL}/recurring-templates/${templateId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch recurring template");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Create a new recurring template
 */
export async function createRecurringTemplate(
  data: CreateRecurringTemplateInput,
): Promise<RecurringTemplate> {
  const res = await fetch(`${API_URL}/recurring-templates`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create recurring template");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Update a recurring template
 */
export async function updateRecurringTemplate(
  templateId: string,
  updates: Partial<RecurringTemplate>,
): Promise<RecurringTemplate> {
  const res = await fetch(`${API_URL}/recurring-templates/${templateId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update recurring template");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Delete a recurring template (and all its instances)
 */
export async function deleteRecurringTemplate(
  templateId: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/recurring-templates/${templateId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete recurring template");
  }
}

/**
 * Deactivate a template (stops generating new instances)
 */
export async function deactivateTemplate(
  templateId: string,
): Promise<RecurringTemplate> {
  const res = await fetch(
    `${API_URL}/recurring-templates/${templateId}/deactivate`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to deactivate template");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Reactivate a template (resumes generating instances)
 */
export async function reactivateTemplate(
  templateId: string,
): Promise<RecurringTemplate> {
  const res = await fetch(
    `${API_URL}/recurring-templates/${templateId}/reactivate`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to reactivate template");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Get all task instances for a template
 */
export async function getTemplateInstances(
  templateId: string,
): Promise<Task[]> {
  const res = await fetch(
    `${API_URL}/recurring-templates/${templateId}/instances`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch template instances");
  }

  const response = await res.json();
  return response.data;
}
