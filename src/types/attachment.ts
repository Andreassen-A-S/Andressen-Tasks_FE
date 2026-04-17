export enum AllowedMimeType {
  JPEG = "image/jpeg",
  PNG = "image/png",
  WEBP = "image/webp",
  HEIC = "image/heic",
  PDF = "application/pdf",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

export const ALLOWED_MIME_TYPE_VALUES = new Set(Object.values(AllowedMimeType));

export const MAX_ATTACHMENTS = 20;

export const MAX_FILE_SIZE: Record<AllowedMimeType, number> = {
  [AllowedMimeType.JPEG]: 10 * 1024 * 1024,
  [AllowedMimeType.PNG]: 10 * 1024 * 1024,
  [AllowedMimeType.WEBP]: 10 * 1024 * 1024,
  [AllowedMimeType.HEIC]: 10 * 1024 * 1024,
  [AllowedMimeType.PDF]: 50 * 1024 * 1024,
  [AllowedMimeType.DOCX]: 50 * 1024 * 1024,
  [AllowedMimeType.XLSX]: 50 * 1024 * 1024,
};

export interface PendingAttachment {
  id: string;
  file: File;
  previewUrl: string | null;
}


export interface TaskAttachment {
  attachment_id: string;
  comment_id: string | null;
  task_id: string;
  uploaded_by: string;
  type: "IMAGE" | "FILE";
  gcs_path: string;
  url: string;
  file_name: string | null;
  mime_type: string | null;
  created_at: string;
}
