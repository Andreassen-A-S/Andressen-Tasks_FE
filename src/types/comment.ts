import { TaskAttachment } from "@/types/attachment";

export interface TaskComment {
  comment_id: string;
  task_id: string;
  user_id: string;
  message: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  author: {
    user_id: string;
    name: string;
    email: string;
    profile_picture_url?: string | null;
  };
  attachments?: TaskAttachment[];
}

export interface CreateCommentRequest {
  message?: string;
  upload_tokens?: string[];
}

export interface UpdateCommentRequest {
  message?: string;
  upload_tokens?: string[];
  remove_attachment_ids?: string[];
}
