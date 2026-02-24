import { getAuthHeaders } from "@/helpers/helpers";
import { TaskAssignment, TaskAssignmentResponse } from "@/types/assignment";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export async function getAllAssignments(): Promise<TaskAssignment[]> {
  const response = await fetch(`${API_URL}/assignments`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch assignments");
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
