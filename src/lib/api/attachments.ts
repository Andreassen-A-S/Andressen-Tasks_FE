import { getAuthHeaders } from "@/helpers/helpers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface PreparedAttachment {
  upload_token: string;
  upload_url: string;
}

export async function prepareAttachments(
  taskId: string,
  files: { file_name: string; mime_type: string; file_size: number }[],
): Promise<PreparedAttachment[]> {
  const res = await fetch(`${API_URL}/attachments/prepare`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ task_id: taskId, files }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to prepare attachments");
  }
  const data = await res.json();
  return data.data;
}

export async function uploadToGcs(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
}
