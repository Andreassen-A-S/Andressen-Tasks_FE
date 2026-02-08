export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum TaskStatus {
  DONE = "DONE",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export interface Task {
  task_id: string;
  created_by: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  created_at: string;
  updated_at: string;
  parent_task_id?: string | null;
  scheduled_date?: string | null;
  unit?: string;
  target_quantity?: number | null;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  created_by: string;
  assigned_users: string[];
  parent_task_id?: string | null;
  scheduled_date?: string | null;
  unit?: string;
  target_quantity?: number | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
  assigned_users: string[];
}
