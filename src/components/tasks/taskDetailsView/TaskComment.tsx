"use client";

import { useEffect, useRef, useState } from "react";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import { X, Paperclip } from "lucide-react";
import Button from "@/components/common/buttons/Button";
import { prepareAttachments, uploadToGcs } from "@/lib/api";
import { getFileExtension, formatNumber } from "@/helpers/helpers";
import { AllowedMimeType, ALLOWED_MIME_TYPE_VALUES, MAX_ATTACHMENTS, MAX_FILE_SIZE, type PendingAttachment } from "@/types/attachment";
import { colors } from "@/constants/colors";
import { toast } from "sonner";
import UserCard from "@/components/common/UserCard";

interface TaskCommentProps {
  taskId: string;
  currentUser: { user_id?: string; name?: string; email?: string; profile_picture_url?: string | null };
  onSubmit: (message: string, uploadTokens: string[]) => Promise<void>;
}


export default function TaskComment({ taskId, currentUser, onSubmit }: TaskCommentProps) {
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef(attachments);

  const hasContent = comment.trim().length > 0 || attachments.length > 0;

  useEffect(() => {
    attachmentsRef.current = attachments;
  });

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
    };
  }, []);

  function addFiles(files: File[]) {
    const valid = files.filter((f) => ALLOWED_MIME_TYPE_VALUES.has(f.type as AllowedMimeType));
    const invalid = files.filter((f) => !ALLOWED_MIME_TYPE_VALUES.has(f.type as AllowedMimeType));

    if (invalid.length > 0) {
      toast.error("Kun billeder, PDF, Word og Excel filer er tilladt.");
    }

    const oversized = valid.filter((f) => f.size > MAX_FILE_SIZE[f.type as AllowedMimeType]);
    const sized = valid.filter((f) => f.size <= MAX_FILE_SIZE[f.type as AllowedMimeType]);

    if (oversized.length > 0) {
      toast.error(
        oversized.length === 1
          ? `${oversized[0].name} overskrider den maksimale filstørrelse.`
          : `${formatNumber(oversized.length)} filer overskrider den maksimale filstørrelse og blev ikke tilføjet.`
      );
    }

    if (!sized.length) return;

    const available = MAX_ATTACHMENTS - attachments.length;
    if (available <= 0) {
      toast.error(`Du kan maksimalt vedhæfte ${MAX_ATTACHMENTS} filer per kommentar.`);
      return;
    }
    const toAdd = sized.slice(0, available);
    if (toAdd.length < sized.length) {
      toast.error(`${formatNumber(sized.length - toAdd.length)} filer blev ikke tilføjet. Maks ${formatNumber(MAX_ATTACHMENTS)} filer per kommentar.`);
    }
    setAttachments((prev) => {
      const remaining = MAX_ATTACHMENTS - prev.length;
      return [...prev, ...toAdd.slice(0, remaining).map((f) => ({
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file: f,
        previewUrl: f.type.startsWith("image/") && f.type !== AllowedMimeType.HEIC ? URL.createObjectURL(f) : null,
      }))];
    });
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
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }

  async function handleSubmit() {
    if (!hasContent || uploading) return;

    setUploading(true);
    try {
      const tokens: string[] = [];

      if (attachments.length > 0) {
        const prepared = await prepareAttachments(taskId, attachments.map((a) => ({
          file_name: a.file.name,
          mime_type: a.file.type as AllowedMimeType,
          file_size: a.file.size,
        })));

        await Promise.all(
          prepared.map((p, i) => uploadToGcs(p.upload_url, attachments[i].file))
        );

        tokens.push(...prepared.map((p) => p.upload_token));
      }

      await onSubmit(comment.trim(), tokens);
      setComment("");
      setAttachments((prev) => {
        prev.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
        return [];
      });
    } catch {
      toast.error("Noget gik galt. Prøv igen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-start gap-3">
        {currentUser.user_id
            ? <UserCard userId={currentUser.user_id} name={currentUser.name || currentUser.email || "Ukendt bruger"}><SingleAvatar name={currentUser.name || currentUser.email || "Ukendt bruger"} size="md" border imageUrl={currentUser.profile_picture_url} /></UserCard>
            : <SingleAvatar name={currentUser.name || currentUser.email || "Ukendt bruger"} size="md" border imageUrl={currentUser.profile_picture_url} />
        }

        <div className="flex-1">
          <div className="mb-2 mt-1">
            <h3 className="h4">Tilføj en kommentar</h3>
          </div>

          {/* Textarea box */}
          <div
            className="rounded-lg overflow-hidden transition-colors bg-background"
            style={{
              border: `1px solid ${dragOver ? colors.blue : colors.border}`,
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
              disabled={uploading}
              rows={4}
              className="w-full px-4 py-3 body-md resize-y focus:outline-none disabled:cursor-not-allowed bg-background"
              style={{ color: colors.textPrimary }}
            />

            {/* Attachment previews inside box */}
            {attachments.length > 0 && (
              <div className="px-4 pb-3 flex flex-wrap gap-2" style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
                {attachments.map((a) => {
                  return (
                    <div key={a.id} className="relative group rounded-lg overflow-hidden border" style={{ borderColor: colors.border }}>
                      {a.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.previewUrl} alt={a.file.name} className="w-20 h-20 object-cover" />
                      ) : (
                        <div className="w-20 h-20 flex flex-col justify-between p-2" style={{ backgroundColor: colors.eggWhite }}>
                          <span className="text-[10px] leading-tight break-all line-clamp-3" style={{ color: colors.textPrimary }}>{a.file.name}</span>
                          <span className="self-start text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide" style={{ border: `1px solid ${colors.border}`, color: colors.textMuted }}>
                            {getFileExtension(a.file.name)}
                          </span>
                        </div>
                      )}
                      {!uploading && (
                        <button
                          onClick={() => removeAttachment(a.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: colors.charcoal }}
                        >
                          <X className="w-3 h-3" style={{ color: colors.textWhite }} />
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
            <Button
              variant="ghost"
              size="md"
              icon={<Paperclip className="w-4 h-4" />}
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Træk filer hertil eller klik for at tilføje
            </Button>

            <Button
              variant="primary"
              size="md"
              loading={uploading}
              disabled={!hasContent || uploading}
              onClick={handleSubmit}
              tooltip={!hasContent ? "Skriv en kommentar først" : undefined}
            >
              Kommenter
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={[...ALLOWED_MIME_TYPE_VALUES].join(",")}
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      </div>
    </div>
  );
}
