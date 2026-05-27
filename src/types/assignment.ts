import { Task } from "./task";
import type { PositionSummary } from "./position";

export interface TaskAssignment {
  assignment_id: string;
  task_id: string;
  user_id: string;
  assigned_at: string;
  completed_at: string | null;
  user: {
    user_id: string;
    name: string;
    email: string;
    position_id: string | null;
    position: PositionSummary | null;
    profile_picture_url?: string | null;
  };
  task: Task;
}

export interface TaskAssignmentResponse {
  success: boolean;
  data: TaskAssignment[];
}
