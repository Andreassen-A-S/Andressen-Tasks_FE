import { apiFetch } from "./apiClient";
import type { Position } from "@/types/position";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPositions(): Promise<Position[]> {
  const res = await apiFetch(`${API_URL}/positions`);
  if (!res.ok) throw new Error("Failed to fetch positions");
  const data = await res.json();
  return data.data;
}

export async function createPosition(name: string): Promise<Position> {
  const res = await apiFetch(`${API_URL}/positions`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create position");
  }
  const data = await res.json();
  return data.data;
}

export async function deletePosition(positionId: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/positions/${positionId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete position");
  }
}
