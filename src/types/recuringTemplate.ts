import { TaskGoalType, TaskPriority, TaskUnit } from "@/types/task";
import { User } from "./users";

export enum RecurrenceFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export interface TemplateAssignee {
  id: string;
  user_id: string;
  user: User;
}

export interface RecurringTemplate {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  unit: TaskUnit;
  target_quantity?: number | null;
  goal_type: TaskGoalType;
  frequency: RecurrenceFrequency;
  interval: number;
  days_of_week?: number[] | null;
  day_of_month?: number | null;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: User; // Included in some responses
  default_assignees?: TemplateAssignee[]; // Array of assignee objects with nested user
}

export interface CreateRecurringTemplateInput {
  title: string;
  description?: string;
  project_id: string;
  priority?: TaskPriority;
  unit?: TaskUnit;
  target_quantity?: number;
  goal_type?: TaskGoalType;
  frequency: RecurrenceFrequency;
  interval?: number;
  days_of_week?: number[];
  day_of_month?: number;
  start_date: string;
  end_date?: string;
  assigned_users?: string[]; // Array of user IDs
}

export interface UpdateRecurringTemplateInput {
  title?: string;
  description?: string;
  project_id?: string;
  priority?: TaskPriority;
  unit?: TaskUnit;
  target_quantity?: number;
  goal_type?: TaskGoalType;
  frequency?: RecurrenceFrequency;
  interval?: number;
  days_of_week?: number[];
  day_of_month?: number;
  start_date?: string;
  end_date?: string | null;
  assigned_users?: string[]; // Array of user IDs
}
