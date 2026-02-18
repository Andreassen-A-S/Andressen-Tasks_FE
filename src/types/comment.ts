import { User } from "./users";

export interface TaskComment {
  comment_id: string;
  task_id: string;
  user_id: string;
  message: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface TaskCommentWithAuthor extends TaskComment {
  author: User;
}

export interface CreateCommentRequest {
  message: string;
}

export interface UpdateCommentRequest {
  message: string;
}
