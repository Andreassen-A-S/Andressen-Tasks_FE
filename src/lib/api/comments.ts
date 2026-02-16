import { getAuthHeaders } from "@/helpers/helpers";
import { CreateCommentRequest, UpdateCommentRequest } from "@/types/comment";
import { CreateTaskEventInput, TaskEvent } from "@/types/taskEvent";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
