import { apiFetch } from "./apiClient";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";
import type { TaskAssignment } from "@/types/assignment";
import type { TaskAttachment } from "@/types/attachment";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface DashboardComment {
  comment_id: string;
  task_id: string;
  user_id: string;
  message: string;
  created_at: string;
  updated_at: string;
  author: { user_id: string; name: string; email: string; profile_picture_url?: string | null };
  attachments: TaskAttachment[];
  task: { task_id: string; title: string; number: number };
}

export interface DashboardData {
  tasks: Task[];
  projects: Project[];
  assignments: TaskAssignment[];
  todayComments: DashboardComment[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const response = await apiFetch(`${API_URL}/dashboard`);
  if (!response.ok) throw new Error("Failed to fetch dashboard data");
  const result = await response.json();
  return result.data;
}
