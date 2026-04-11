"use client";

import { useRef, useState } from "react";
import SingleAvatar from "@/components/common/label/singleAvatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faPaperclip, faXmark, faFile, faFilePdf, faFileWord, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { prepareAttachments, uploadToGcs } from "@/lib/api";
import { colors } from "@/constants/colors";
import { toast } from "sonner";

const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/heic",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

interface PendingAttachment {
  id: string;
  file: File;
}

interface TaskCommentProps {
  taskId: string;
  currentUser: { name?: string; email?: string };
  onSubmit: (message: string, uploadTokens: string[]) => Promise<void>;
  submitting: boolean;
}

function getFileIcon(mimeType: string) {
  if (mimeType === "application/pdf") return faFilePdf;
  if (mimeType.includes("word") || mimeType.includes("document")) return faFileWord;
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return faFileExcel;
  return faFile;
}

export default function TaskComment({ taskId, currentUser, onSubmit, submitting }: TaskCommentProps) {
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasContent = comment.trim().length > 0 || attachments.length > 0;

  function addFiles(files: File[]) {
    const valid = files.filter((f) => ALLOWED_MIME_TYPES.includes(f.type));
    const invalid = files.filter((f) => !ALLOWED_MIME_TYPES.includes(f.type));

    if (invalid.length > 0) {
      toast.error("Kun billeder, PDF, Word og Excel filer er tilladt.");
    }

    if (!valid.length) return;
    const pending: PendingAttachment[] = valid.map((f) => ({ id: crypto.randomUUID(), file: f }));
    setAttachments((prev) => [...prev, ...pending]);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  function handlePaste(e: React.ClipboardEvent) {
    const files = Array.from(e.clipboardData.files);
    if (files.length) addFiles(files);
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSubmit() {
    if (!hasContent || submitting) return;

    try {
      const tokens: string[] = [];

      if (attachments.length > 0) {
        const prepared = await prepareAttachments(taskId, attachments.map((a) => ({
          file_name: a.file.name,
          mime_type: a.file.type,
          file_size: a.file.size,
        })));

        await Promise.all(
          prepared.map((p, i) => uploadToGcs(p.upload_url, attachments[i].file))
        );

        tokens.push(...prepared.map((p) => p.upload_token));
      }

      await onSubmit(comment.trim(), tokens);
      setComment("");
      setAttachments([]);
    } catch {
      toast.error("Noget gik galt. Prøv igen.");
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-start gap-3">
        <SingleAvatar name={currentUser.name || currentUser.email || "Ukendt bruger"} size="sm" />
        <div className="flex-1">
          <div className="mb-2 mt-1">
            <h3 className="h4">Tilføj en kommentar</h3>
          </div>

          {/* Textarea box */}
          <div
            className="rounded-lg overflow-hidden transition-colors"
            style={{
              border: `1px solid ${dragOver ? colors.blue : colors.border}`,
              backgroundColor: colors.white,
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onPaste={handlePaste}
              placeholder="Skriv din kommentar her..."
              disabled={submitting}
              rows={4}
              className="w-full px-4 py-3 body-md resize-y focus:outline-none disabled:cursor-not-allowed"
              style={{ backgroundColor: colors.white, color: colors.textPrimary }}
            />

            {/* Attachment previews inside box */}
            {attachments.length > 0 && (
              <div className="px-4 pb-3 flex flex-wrap gap-2" style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
                {attachments.map((a) => {
                  const isImage = a.file.type.startsWith("image/");
                  return (
                    <div key={a.id} className="relative group rounded-lg overflow-hidden border" style={{ borderColor: colors.border }}>
                      {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={URL.createObjectURL(a.file)} alt={a.file.name} className="w-20 h-20 object-cover" />
                      ) : (
                        <div className="w-36 h-12 flex items-center gap-2 px-3" style={{ backgroundColor: colors.eggWhite }}>
                          <FontAwesomeIcon icon={getFileIcon(a.file.type)} style={{ color: colors.textMuted }} className="text-sm shrink-0" />
                          <span className="body-xs truncate">{a.file.name}</span>
                        </div>
                      )}
                      {!submitting && (
                        <button
                          onClick={() => removeAttachment(a.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: colors.charcoal }}
                        >
                          <FontAwesomeIcon icon={faXmark} className="text-xs" style={{ color: colors.textWhite }} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Toolbar row */}
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{ color: colors.textMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.muted)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <FontAwesomeIcon icon={faPaperclip} className="text-sm" />
              <span className="caption">Træk filer hertil eller klik for at tilføje</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasContent || submitting}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 btn-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: colors.green, color: colors.textWhite }}
            >
              {submitting ? (
                <><FontAwesomeIcon icon={faSpinner} spin />Sender...</>
              ) : "Kommenter"}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_MIME_TYPES.join(",")}
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      </div>
    </div>
  );
}
