import { apiFetch } from "./apiClient";
import type { TaskGoal, TaskUnit } from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function setGoal(taskId: string, input: { target_quantity: number; unit: TaskUnit; current_quantity?: number }): Promise<TaskGoal> {
  const res = await apiFetch(`${API_URL}/tasks/${taskId}/goal`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to set goal");
  const data = await res.json();
  return data.data;
}

export async function removeGoal(taskId: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/tasks/${taskId}/goal`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove goal");
}
