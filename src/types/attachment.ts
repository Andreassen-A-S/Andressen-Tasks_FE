export enum AllowedMimeType {
  JPEG = "image/jpeg",
  PNG = "image/png",
  WEBP = "image/webp",
  HEIC = "image/heic",
  PDF = "application/pdf",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
