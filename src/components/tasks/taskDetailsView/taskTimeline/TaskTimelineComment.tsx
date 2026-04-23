"use client";

import { useState } from "react";
import type { TaskEvent } from "@/types/taskEvent";
import { AllowedMimeType, type TaskAttachment } from "@/types/attachment";
import SingleAvatar from "../../../common/label/SingleAvatar";
import { formatCommentDate } from "@/helpers/helpers";
import { faEllipsis, faTrash, faPencil, faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { colors } from "@/constants/colors";
import DropdownMenu from "@/components/common/DropdownMenu";
import Button from "@/components/common/buttons/Button";
import OutlineBadge from "@/components/common/label/OutlineBadge";
import ConfirmModal from "@/components/common/ConfirmModal";
import FileAttachmentCard from "../FileAttachmentCard";
import CommentEditForm from "./CommentEditForm";

type Props = {
    event: TaskEvent;
    actorName: string;
    currentUserId?: string;
    isAdmin?: boolean;
    isTaskOwner?: boolean;
    isArchived?: boolean;
    editedBy?: string;
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

export default function TaskTimelineComment({ event, actorName, currentUserId, isAdmin, isTaskOwner, isArchived = false, editedBy, onDelete, onUpdate }: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);

    const isDeleted = event.type === "COMMENT_DELETED";
    const message = isDeleted
        ? "(Kommentar slettet)"
        : event.comment?.message ?? event.message ?? "";

    const attachments = event.comment?.attachments ?? [];

    const commentId = event.comment?.comment_id ?? event.comment_id;
    const canDelete = !isArchived && !isDeleted && onDelete && !!commentId && (isAdmin || currentUserId === event.actor_id);
    const canEdit = !isArchived && !isDeleted && !!commentId && currentUserId === event.actor_id;

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

    return (
        <>
            <div className="flex items-start gap-3">
                <SingleAvatar name={actorName} size="sm" />
                <div className="flex-1 rounded-lg overflow-hidden" style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}>
                    <div className="pl-4 pr-1 py-1 flex items-center gap-1" style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.eggWhite }}>
                        <span className="label-lg flex-shrink-0">{actorName}</span>
                        {editedBy ? (
                            <span className="body-xs flex-shrink-0 inline-flex items-center gap-1.5">
                                {formatCommentDate(event.created_at)}
                                <FontAwesomeIcon icon={faCircle} style={{ fontSize: 2 }} />
                                redigeret af {editedBy}
                            </span>
                        ) : (
                            <>
                                <span className="body-xs flex-shrink-0">kommenterede</span>
                                <span className="body-xs flex-shrink-0">{formatCommentDate(event.created_at)}</span>
                            </>
                        )}

                        <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                            {isTaskOwner && (
                                <OutlineBadge label="Ejer" tooltip={currentUserId === event.actor_id ? "Du er opgavens ejer" : "Opgavens ejer"} />
                            )}
                            {(canEdit || canDelete) && (
                                <div>
                                    <DropdownMenu
                                        trigger={
                                            <Button variant="ghost" size="sm" icon={faEllipsis} iconOnly tooltip="Mere" />
                                        }
                                        items={[
                                            ...(canEdit ? [{
                                                label: "Rediger",
                                                icon: faPencil,
                                                onClick: () => setEditing(true),
                                            }] : []),
                                            ...(canDelete ? [{
                                                label: "Slet",
                                                icon: faTrash,
                                                danger: true,
                                                dividerBefore: canEdit,
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
                                    <p
                                        className="body-sm leading-relaxed whitespace-pre-wrap"
                                        style={isDeleted ? { color: colors.textMuted, fontStyle: "italic" } : undefined}
                                    >
                                        {message}
                                    </p>
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
