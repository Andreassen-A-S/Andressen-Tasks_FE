import { apiFetch } from "./apiClient";
import {
  CreateCommentRequest,
  TaskComment,
  UpdateCommentRequest,
} from "@/types/comment";
import { TaskEvent } from "@/types/taskEvent";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Comment API functions
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const response = await apiFetch(`${API_URL}/comments/task/${taskId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }

  const result = await response.json();
  return result.data;
}

export async function createComment(
  taskId: string,
  data: CreateCommentRequest,
): Promise<TaskComment> {
  const response = await apiFetch(`${API_URL}/comments/task/${taskId}`, {
    method: "POST",
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
): Promise<TaskComment> {
  const response = await apiFetch(`${API_URL}/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update comment");
  }

  const result = await response.json();
  return result.data;
}

export async function deleteComment(commentId: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/comments/${commentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete comment");
  }
}

// Event logging API function can be added here as needed

export async function getTaskEvents(taskId: string): Promise<TaskEvent[]> {
  const res = await apiFetch(`${API_URL}/task-events/${taskId}`);
  if (!res.ok) throw new Error("Failed to fetch task events");
  const data = await res.json();
  return data.data;
}
