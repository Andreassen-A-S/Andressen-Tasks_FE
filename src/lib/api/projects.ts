import { getAuthHeaders } from "@/helpers/helpers";
import type { CreateProjectInput, Project, UpdateProjectInput } from "@/types/project";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/projects`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return data.data;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create project");
  const data = await res.json();
  return data.data;
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update project");
  const data = await res.json();
  return data.data;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete project");
}
