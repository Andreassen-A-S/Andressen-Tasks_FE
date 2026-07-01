"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { formatNumber } from "@/helpers/helpers";
import { Paperclip, X } from "lucide-react";
import { updateComment, prepareAttachments, uploadToGcs } from "@/lib/api";
import { AllowedMimeType, ALLOWED_MIME_TYPE_VALUES, MAX_ATTACHMENTS, MAX_FILE_SIZE, PendingAttachment, type TaskAttachment } from "@/types/attachment";
import { colors } from "@/constants/colors";
import Button from "@/components/common/buttons/Button";
import { toast } from "sonner";
import type { MentionableUser } from "@/types/users";
import MentionEditor, { type MentionEditorHandle } from "@/components/common/MentionEditor";
import { tiptapToTokenText, extractMentionUserIdsFromJson, tokenTextToTiptap } from "@/lib/tiptapMentions";
import { extractMentionUserIds } from "@/helpers/mentions";
import type { JSONContent } from "@tiptap/core";

interface Props {
    initialText: string;
    existingAttachments: TaskAttachment[];
    taskId: string;
    commentId: string;
    mentionableUsers?: MentionableUser[];
    onSave: () => Promise<void>;
    onCancel: () => void;
}

export default function CommentEditForm({ initialText, existingAttachments, taskId, commentId, mentionableUsers = [], onSave, onCancel }: Props) {
    const [editorState, setEditorState] = useState<{ isEmpty: boolean; json: JSONContent }>(() => ({
        isEmpty: !initialText.trim(),
        json: tokenTextToTiptap(initialText),
    }));
    const [saving, setSaving] = useState(false);
    const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
    const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
    const [dragOver, setDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<MentionEditorHandle>(null);
    const pendingAttachmentsRef = useRef(pendingAttachments);

    const visibleAttachments = existingAttachments.filter((a) => !removedIds.has(a.attachment_id));

    useEffect(() => {
        pendingAttachmentsRef.current = pendingAttachments;
    });

    useEffect(() => {
        return () => {
            pendingAttachmentsRef.current.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
        };
    }, []);

    function addFiles(files: File[]) {
        const valid = files.filter((f) => ALLOWED_MIME_TYPE_VALUES.has(f.type as AllowedMimeType));
        const invalid = files.filter((f) => !ALLOWED_MIME_TYPE_VALUES.has(f.type as AllowedMimeType));
        if (invalid.length > 0) toast.error("Kun billeder, PDF, Word og Excel filer er tilladt.");

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

        const currentTotal = visibleAttachments.length + pendingAttachments.length;
        const available = MAX_ATTACHMENTS - currentTotal;
        if (available <= 0) {
            toast.error(`Du kan maksimalt vedhæfte ${MAX_ATTACHMENTS} filer per kommentar.`);
            return;
        }
        const toAdd = sized.slice(0, available);
        if (toAdd.length < sized.length) {
            toast.error(`${sized.length - toAdd.length} filer blev ikke tilføjet. Maks ${MAX_ATTACHMENTS} filer per kommentar.`);
        }
        setPendingAttachments((prev) => [
            ...prev,
            ...toAdd.map((f) => ({
                id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                file: f,
                previewUrl: f.type.startsWith("image/") && f.type !== AllowedMimeType.HEIC ? URL.createObjectURL(f) : null,
            })),
        ]);
    }

    function handleCancel() {
        pendingAttachments.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
        onCancel();
    }

    function removeExisting(id: string) {
        setRemovedIds((prev) => new Set([...prev, id]));
    }

    const hasChanges = useMemo(() => {
        const tokenText = tiptapToTokenText(editorState.json);
        return tokenText.trim() !== initialText.trim() || pendingAttachments.length > 0 || removedIds.size > 0;
    }, [editorState.json, initialText, pendingAttachments.length, removedIds.size]);

    async function handleSave() {
        if (!hasChanges) return;
        setSaving(true);
        try {
            let upload_tokens: string[] = [];
            if (pendingAttachments.length > 0) {
                const prepared = await prepareAttachments(taskId, pendingAttachments.map((a) => ({
                    file_name: a.file.name,
                    mime_type: a.file.type as AllowedMimeType,
                    file_size: a.file.size,
                })));
                await Promise.all(prepared.map((p, i) => uploadToGcs(p.upload_url, pendingAttachments[i].file)));
                upload_tokens = prepared.map((p) => p.upload_token);
            }
            const tokenText = tiptapToTokenText(editorState.json).trim();
            const oldMentionIds = new Set(extractMentionUserIds(initialText));
            const newMentionIds = extractMentionUserIdsFromJson(editorState.json).filter((id) => !oldMentionIds.has(id));
            await updateComment(commentId, {
                message: tokenText !== initialText.trim() ? tokenText : undefined,
                upload_tokens: upload_tokens.length > 0 ? upload_tokens : undefined,
                remove_attachment_ids: removedIds.size > 0 ? [...removedIds] : undefined,
                mention_user_ids: newMentionIds.length > 0 ? newMentionIds : undefined,
            });
            pendingAttachments.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
            await onSave();
        } catch {
            toast.error("Noget gik galt. Prøv igen.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <div
                className="-mx-4 -my-4 p-2 space-y-1"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); }}
                onPaste={(e) => { const files = Array.from(e.clipboardData.files); if (files.length) addFiles(files); }}
            >
                <MentionEditor
                    ref={editorRef}
                    initialTokenText={initialText}
                    mentionableUsers={mentionableUsers}
                    onUpdate={setEditorState}
                    onSubmit={handleSave}
                    className="w-full body-sm px-3 py-2 rounded-md"
                    style={{ border: `1px solid ${dragOver ? colors.blue : colors.border}`, minHeight: 80 }}
                />

                {visibleAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {visibleAttachments.map((a) => (
                            <div key={a.attachment_id} className="relative group rounded-md overflow-hidden border w-16 h-16 flex items-center justify-center" style={{ borderColor: colors.border, backgroundColor: colors.eggWhite }}>
                                {a.type === "IMAGE" && a.mime_type !== AllowedMimeType.HEIC ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={a.url} alt={a.file_name ?? "Billede"} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] text-center px-1 break-all" style={{ color: colors.textMuted }}>{a.file_name}</span>
                                )}
                                <button
                                    type="button"
                                    aria-label="Fjern vedhæftning"
                                    onClick={() => removeExisting(a.attachment_id)}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ backgroundColor: colors.charcoal }}
                                >
                                    <X className="w-2.5 h-2.5" style={{ color: colors.textWhite }} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {pendingAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {pendingAttachments.map((a) => (
                            <div key={a.id} className="relative group rounded-md overflow-hidden border w-16 h-16 flex items-center justify-center" style={{ borderColor: colors.border, backgroundColor: colors.eggWhite }}>
                                {a.previewUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={a.previewUrl} alt={a.file.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] text-center px-1 break-all" style={{ color: colors.textMuted }}>{a.file.name}</span>
                                )}
                                <button
                                    type="button"
                                    aria-label="Fjern vedhæftning"
                                    onClick={() => {
                                        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
                                        setPendingAttachments((prev) => prev.filter((x) => x.id !== a.id));
                                    }}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ backgroundColor: colors.charcoal }}
                                >
                                    <X className="w-2.5 h-2.5" style={{ color: colors.textWhite }} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="md" icon={<Paperclip className="w-4 h-4" />} onClick={() => fileInputRef.current?.click()}>
                        Træk filer hertil eller klik for at tilføje
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="md" onClick={handleCancel}>Annuller</Button>
                        <Button variant="primary" size="md" loading={saving} disabled={!hasChanges} onClick={handleSave}>Gem</Button>
                    </div>
                </div>
            </div>
            <input ref={fileInputRef} type="file" multiple accept={[...ALLOWED_MIME_TYPE_VALUES].join(",")} hidden onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = ""; }} />
        </>
    );
}
