import { TaskAttachment } from "./attachment";
import type { PositionSummary } from "./position";

export enum TaskEventType {
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DELETED = "TASK_DELETED",
  TASK_STATUS_CHANGED = "TASK_STATUS_CHANGED",
  TASK_PRIORITY_CHANGED = "TASK_PRIORITY_CHANGED",
  ASSIGNMENT_CREATED = "ASSIGNMENT_CREATED",
  ASSIGNMENT_UPDATED = "ASSIGNMENT_UPDATED",
  ASSIGNMENT_DELETED = "ASSIGNMENT_DELETED",
  COMMENT_CREATED = "COMMENT_CREATED",
  COMMENT_UPDATED = "COMMENT_UPDATED",
  COMMENT_DELETED = "COMMENT_DELETED",
  PROGRESS_LOGGED = "PROGRESS_LOGGED",
  SUBTASK_ADDED = "SUBTASK_ADDED",
  SUBTASK_REMOVED = "SUBTASK_REMOVED",
}

export interface CreateTaskEventInput {
  task_id: { connect: { task_id: string } };
  type: TaskEventType;
  message: string;
  before_json?: Record<string, unknown>;
  after_json?: Record<string, unknown>;
}

export interface TaskEvent {
  event_id: string;
  task_id: string;
  actor_id: string | null;
  type: TaskEventType;
  message: string | null;

  comment_id?: string | null;
  progress_id?: string | null;
  assignment_id?: string | null;

  before_json?: unknown;
  after_json?: unknown;
  created_at: string;

  // ✅ included relations for the timeline
  actor?: {
    user_id: string;
    name?: string | null;
    email: string;
    position_id?: string | null;
    position?: PositionSummary | null;
  } | null;

  comment?: {
    comment_id: string;
    task_id: string;
    user_id: string;
    message: string;
    created_at: string;
    updated_at: string;
    attachments: TaskAttachment[];
  } | null;

  assignment?: unknown | null;
  progress?: unknown | null;
}
