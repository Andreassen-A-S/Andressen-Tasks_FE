import { apiFetch } from "./apiClient";
import {
  CreateSubtaskInput,
  CreateTaskInput,
  Task,
  TaskUnit,
  UpdateTaskInput,
} from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getTasks(): Promise<Task[]> {
  const res = await apiFetch(`${API_URL}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return data.data;
}

export async function getTask(id: string): Promise<Task> {
  const res = await apiFetch(`${API_URL}/tasks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  const data = await res.json();
  return data.data;
}

export async function createTask(task: CreateTaskInput): Promise<Task> {
  const res = await apiFetch(`${API_URL}/tasks`, {
    method: "POST",
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to create task");
  const data = await res.json();
  return data.data;
}

export async function updateTask(
  id: string,
  updates: Partial<UpdateTaskInput>,
): Promise<Task> {
  const res = await apiFetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update task");
  const data = await res.json();
  return data.data;
}

export async function createSubtask(task: CreateSubtaskInput): Promise<Task> {
  const res = await apiFetch(`${API_URL}/tasks/subtasks`, {
    method: "POST",
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
  const res = await apiFetch(`${API_URL}/tasks/${taskId}/progress`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add task progress");
}

export async function deleteTask(id: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task");
}
