"use client";

import { useState } from "react";
import type { TaskEvent } from "@/types/taskEvent";
import { AllowedMimeType, type TaskAttachment } from "@/types/attachment";
import SingleAvatar from "../../../common/label/SingleAvatar";
import { formatCommentDate, downloadImages, downloadImagesAsZip } from "@/helpers/helpers";
import { Ellipsis, Trash2, Pencil, ImageDown } from "lucide-react";
import { toast } from "sonner";
import { colors } from "@/constants/colors";
import DropdownMenu from "@/components/common/DropdownMenu";
import Button from "@/components/common/buttons/Button";
import OutlineBadge from "@/components/common/label/OutlineBadge";
import UserCard from "@/components/common/UserCard";
import ConfirmModal from "@/components/common/ConfirmModal";
import FileAttachmentCard from "../FileAttachmentCard";
import CommentEditForm from "./CommentEditForm";
import LinkedText from "@/components/common/LinkedText";
import EditHistoryPopover from "@/components/common/EditHistoryPopover";

type Props = {
    event: TaskEvent;
    actorName: string;
    deletedEvent?: TaskEvent;
    currentUserId?: string;
    isAdmin?: boolean;
    isTaskOwner?: boolean;
    isAssignee?: boolean;
    isArchived?: boolean;
    editHistory?: TaskEvent[];
    onDelete?: (commentId: string) => Promise<void>;
    onUpdate?: () => Promise<void>;
};

function AttachmentSection({ attachments }: { attachments: TaskAttachment[] }) {
    const images = attachments.filter((a) => a.type === "IMAGE" && a.mime_type !== AllowedMimeType.HEIC);
    const files = attachments.filter((a) => a.type === "FILE" || a.mime_type === AllowedMimeType.HEIC);

    return (
        <div className="mt-3 space-y-3">
            {images.map((img) => (
                <a
                    key={img.attachment_id}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-fit"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={img.url}
                        alt={img.file_name ?? "Billede"}
                        style={{ borderColor: colors.border }}
                        className="max-w-sm max-h-80 rounded-md border object-cover hover:opacity-90 transition-opacity"
                    />
                </a>
            ))}

            {files.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {files.map((file) => (
                        <FileAttachmentCard
                            key={file.attachment_id}
                            fileName={file.file_name ?? "Fil"}
                            mimeType={file.mime_type}
                            url={file.url}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function TaskTimelineComment({ event, actorName, deletedEvent, currentUserId, isAdmin, isTaskOwner, isAssignee, isArchived = false, editHistory, onDelete, onUpdate }: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const isDeleted = !!deletedEvent;
    const message = isDeleted
        ? "(Kommentar slettet)"
        : event.comment?.message ?? event.message ?? "";

    const attachments = event.comment?.attachments ?? [];
    const images = attachments.filter((a) => a.type === "IMAGE" && a.mime_type !== AllowedMimeType.HEIC);

    const commentId = event.comment?.comment_id ?? event.comment_id;
    const canDelete = !isArchived && !isDeleted && onDelete && !!commentId && (isAdmin || currentUserId === event.actor_id);
    const canEdit = !isArchived && !isDeleted && !!commentId && currentUserId === event.actor_id;
    const canDownloadImages = !!isAdmin && images.length > 0;
    const isAuthor = currentUserId === event.actor_id;

    async function handleDelete() {
        if (!onDelete || !commentId) return;
        setDeleting(true);
        try {
            await onDelete(commentId);
        } finally {
            setDeleting(false);
            setConfirmOpen(false);
        }
    }

    async function handleDownloadImages() {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            if (images.length > 1) {
                const date = event.created_at.slice(0, 10);
                await downloadImagesAsZip(images, `${actorName} ${date}`);
            } else {
                await downloadImages(images);
            }
        } catch {
            toast.error("Kunne ikke hente billeder. Prøv igen.");
        } finally {
            setIsDownloading(false);
        }
    }

    return (
        <>
            <div className="flex items-start gap-3">
                {event.actor_id
                    ? <UserCard userId={event.actor_id} name={actorName} actor={event.actor}><SingleAvatar name={actorName} size="md" border imageUrl={event.actor?.profile_picture_url} /></UserCard>
                    : <SingleAvatar name={actorName} size="md" border />
                }
                <div className={`flex-1 bg-background border rounded-lg overflow-hidden ${isAuthor ? "border-accent/30" : "border-border"}`}>
                    <div className={`border-b pl-4 pr-1 py-1 flex items-center gap-1 ${isAuthor ? "border-accent/30 bg-accent-surface" : "border-border bg-surface"}`}>
                        <span className="label-lg shrink-0">{actorName}</span>
                        <span className="body-xs shrink-0">kommenterede</span>
                        <span className="body-xs shrink-0">{formatCommentDate(event.created_at)}</span>

                        <div className="ml-auto flex min-h-7 items-center justify-end gap-1 shrink-0">
                            {editHistory && editHistory.length > 0 && (
                                <EditHistoryPopover
                                    edits={[...editHistory].reverse().map((e) => ({
                                        name: e.actor?.name ?? e.actor?.email ?? "Ukendt bruger",
                                        imageUrl: e.actor?.profile_picture_url,
                                        timeLabel: formatCommentDate(e.created_at),
                                        beforeText: (e.before_json as Record<string, unknown> | null)?.message as string | undefined,
                                        afterText: e.type === "COMMENT_DELETED" ? "" : (e.after_json as Record<string, unknown> | null)?.message as string | undefined,
                                    }))}
                                    created={{
                                        name: actorName,
                                        imageUrl: event.actor?.profile_picture_url,
                                        timeLabel: formatCommentDate(event.created_at),
                                        afterText: (editHistory[0]?.before_json as Record<string, unknown> | null)?.message as string | undefined,
                                    }}
                                />
                            )}
                            {isTaskOwner && (
                                <OutlineBadge label="Ejer" tooltip={isAuthor ? "Du er opgavens ejer" : "Opgavens ejer"} variant={isAuthor ? "accent" : "neutral"} />
                            )}
                            {isAssignee && !isTaskOwner && (
                                <OutlineBadge label="Tildelt" tooltip={isAuthor ? "Du er tildelt opgaven" : "Tildelt opgaven"} variant={isAuthor ? "accent" : "neutral"} />
                            )}
                            {(canEdit || canDelete || canDownloadImages) && (
                                <div>
                                    <DropdownMenu
                                        trigger={
                                            <Button variant="ghost" size="sm" icon={<Ellipsis className="w-4 h-4" />} iconOnly tooltip="Mere" />
                                        }
                                        items={[
                                            ...(canDownloadImages ? [{
                                                label: isDownloading ? "Downloader..." : "Download billeder",
                                                icon: <ImageDown className="w-4 h-4" />,
                                                disabled: isDownloading,
                                                onClick: handleDownloadImages,
                                            }] : []),
                                            ...(canEdit ? [{
                                                label: "Rediger",
                                                icon: <Pencil className="w-4 h-4" />,
                                                onClick: () => setEditing(true),
                                            }] : []),
                                            ...(canDelete ? [{
                                                label: "Slet",
                                                icon: <Trash2 className="w-4 h-4" />,
                                                danger: true,
                                                dividerBefore: canEdit || canDownloadImages,
                                                onClick: () => setConfirmOpen(true),
                                            }] : []),
                                        ]}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-4 py-4">
                        {editing && commentId ? (
                            <CommentEditForm
                                initialText={message}
                                existingAttachments={attachments}
                                taskId={event.task_id}
                                commentId={commentId}
                                onSave={async () => { await onUpdate?.(); setEditing(false); }}
                                onCancel={() => setEditing(false)}
                            />
                        ) : (
                            <>
                                {message && (
                                    <LinkedText
                                        as="p"
                                        text={message}
                                        className="body-sm leading-relaxed whitespace-pre-wrap"
                                        style={isDeleted ? { color: colors.textMuted, fontStyle: "italic" } : undefined}
                                    />
                                )}
                                {attachments.length > 0 && (
                                    <>
                                        {message && <hr style={{ borderColor: colors.border }} className="mt-3" />}
                                        <AttachmentSection attachments={attachments} />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Slet kommentar"
                description="Er du sikker på, at du vil slette denne kommentar?"
                confirmLabel="Slet"
                cancelLabel="Annuller"
                danger
                loading={deleting}
            />
        </>
    );
}
