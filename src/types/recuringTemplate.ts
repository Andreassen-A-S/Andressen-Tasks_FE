import { TaskGoalType, TaskPriority, TaskUnit } from "@/types/task";

export enum RecurrenceFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

// types/recurringTemplate.ts (if you want to create a proper type)
export interface CreateRecurringTemplateInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  unit: TaskUnit;
  target_quantity?: number;
  goal_type: TaskGoalType;
  frequency: RecurrenceFrequency;
  interval: number;
  days_of_week?: number[];
  day_of_month?: number;
  start_date: string;
  end_date?: string;
  assigned_users?: string[];
}

export interface RecurringTemplate {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  unit: TaskUnit;
  target_quantity?: number;
  goal_type: TaskGoalType;
  frequency: RecurrenceFrequency;
  interval: number;
  days_of_week?: number[];
  day_of_month?: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
