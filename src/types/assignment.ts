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
    position: string;
  };
}

export interface TaskAssignmentResponse {
  success: boolean;
  data: TaskAssignment[];
}
