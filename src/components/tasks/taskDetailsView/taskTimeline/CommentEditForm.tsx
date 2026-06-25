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
import MentionDropdown from "@/components/common/MentionDropdown";
import { buildTokenText, tokenToDisplayText, extractMentionUserIds, parseTokenMentions } from "@/helpers/mentions";

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
    const [editText, setEditText] = useState(() => tokenToDisplayText(initialText));
    const [saving, setSaving] = useState(false);
    const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
    const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
    const [dragOver, setDragOver] = useState(false);
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionStart, setMentionStart] = useState<number | null>(null);
    const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
    const [pendingMentions, setPendingMentions] = useState<{ name: string; userId: string }[]>(() => parseTokenMentions(initialText));

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pendingAttachmentsRef = useRef(pendingAttachments);

    const visibleAttachments = existingAttachments.filter((a) => !removedIds.has(a.attachment_id));

    const mentionCandidates = useMemo(() => {
        if (mentionQuery === null || !mentionableUsers.length) return [];
        const q = mentionQuery.toLowerCase();
        return mentionableUsers.filter((u) => u.name.toLowerCase().split(/\s+/).some((word) => word.startsWith(q))).slice(0, 8);
    }, [mentionQuery, mentionableUsers]);

    useEffect(() => {
        pendingAttachmentsRef.current = pendingAttachments;
    });

    useEffect(() => {
        return () => {
            pendingAttachmentsRef.current.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
        };
    }, []);

    function handleTextChange(value: string) {
        setEditText(value);
        if (!mentionableUsers.length) return;
        const beforeCursor = value.slice(0, textareaRef.current?.selectionStart ?? value.length);
        const lastAt = beforeCursor.lastIndexOf("@");
        if (lastAt === -1) { setMentionQuery(null); setMentionStart(null); return; }
        const afterAt = beforeCursor.slice(lastAt + 1);
        if (/\s/.test(afterAt)) { setMentionQuery(null); setMentionStart(null); return; }
        setMentionQuery(afterAt);
        setMentionStart(lastAt);
        setSelectedMentionIndex(0);
    }

    function handleMentionSelect(user: MentionableUser) {
        const atIndex = mentionStart ?? 0;
        const queryLen = mentionQuery?.length ?? 0;
        const newText = editText.slice(0, atIndex) + `@${user.name} ` + editText.slice(atIndex + 1 + queryLen);
        const newCursor = atIndex + user.name.length + 2;
        setEditText(newText);
        setMentionQuery(null);
        setMentionStart(null);
        setPendingMentions((prev) => {
            if (prev.some((m) => m.userId === user.user_id)) return prev;
            return [...prev, { name: user.name, userId: user.user_id }];
        });
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.selectionStart = newCursor;
                textareaRef.current.selectionEnd = newCursor;
                textareaRef.current.focus();
            }
        });
    }

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

    const initialDisplayText = useMemo(() => tokenToDisplayText(initialText), [initialText]);
    const hasChanges = editText.trim() !== initialDisplayText || pendingAttachments.length > 0 || removedIds.size > 0;

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
            const trimmed = editText.trim();
            const tokenText = buildTokenText(trimmed, pendingMentions);
            const oldMentionIds = new Set(extractMentionUserIds(initialText));
            const newMentionIds = extractMentionUserIds(tokenText).filter(id => !oldMentionIds.has(id));
            await updateComment(commentId, {
                message: tokenText !== initialText ? tokenText : undefined,
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
            >
                <textarea
                    ref={textareaRef}
                    className="w-full body-sm rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
                    style={{ border: `1px solid ${dragOver ? colors.blue : colors.border}`, color: colors.textPrimary, minHeight: 80 }}
                    value={editText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onPaste={(e) => { const files = Array.from(e.clipboardData.files); if (files.length) addFiles(files); }}
                    autoFocus
                    onKeyDown={(e) => {
                        if (mentionCandidates.length > 0) {
                            if (e.key === "ArrowDown") { e.preventDefault(); setSelectedMentionIndex((i) => Math.min(i + 1, mentionCandidates.length - 1)); return; }
                            if (e.key === "ArrowUp") { e.preventDefault(); setSelectedMentionIndex((i) => Math.max(i - 1, 0)); return; }
                            if (e.key === "Escape") { setMentionQuery(null); setMentionStart(null); return; }
                            if (e.key === "Enter" || e.key === "Tab") {
                                const user = mentionCandidates[selectedMentionIndex];
                                if (user) { e.preventDefault(); handleMentionSelect(user); return; }
                            }
                        }
                        if (e.key === "Escape") handleCancel();
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSave();
                    }}
                />

                {/* Mention dropdown */}
                {mentionCandidates.length > 0 && (
                    <MentionDropdown
                        anchor={textareaRef.current}
                        anchorIndex={mentionStart}
                        users={mentionCandidates}
                        selectedIndex={selectedMentionIndex}
                        onSelect={handleMentionSelect}
                    />
                )}

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
