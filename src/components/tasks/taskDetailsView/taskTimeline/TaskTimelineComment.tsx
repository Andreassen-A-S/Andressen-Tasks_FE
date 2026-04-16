"use client";

import { useState } from "react";
import type { TaskEvent } from "@/types/taskEvent";
import type { TaskAttachment } from "@/types/attachment";
import SingleAvatar from "../../../common/label/singleAvatar";
import { formatCommentDate } from "@/helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faTrash } from "@fortawesome/free-solid-svg-icons";
import { colors } from "@/constants/colors";
import DropdownMenu from "@/components/common/DropdownMenu";
import ConfirmModal from "@/components/common/ConfirmModal";
import { AllowedMimeType } from "@/types/attachment";
import FileAttachmentCard from "../FileAttachmentCard";

type Props = {
    event: TaskEvent;
    actorName: string;
    currentUserId?: string;
    isAdmin?: boolean;
    onDelete?: (commentId: string) => Promise<void>;
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

export default function TaskTimelineComment({ event, actorName, currentUserId, isAdmin, onDelete }: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isDeleted = event.type === "COMMENT_DELETED";
    const message = isDeleted
        ? "(Kommentar slettet)"
        : event.comment?.message ?? event.message ?? "";

    const attachments = event.comment?.attachments ?? [];

    const commentId = event.comment?.comment_id ?? event.comment_id;
    const canDelete = !isDeleted && onDelete && !!commentId && (isAdmin || currentUserId === event.actor_id);

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
                    <div className="pl-4 pr-2 py-2 flex items-center gap-1" style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.eggWhite }}>
                        <span className="label-lg flex-shrink-0">{actorName}</span>
                        <span className="body-xs flex-shrink-0">kommenterede</span>
                        <span className="caption flex-shrink-0">{formatCommentDate(event.created_at)}</span>

                        {canDelete && (
                            <div className="ml-auto">
                                <DropdownMenu
                                    trigger={
                                        <button
                                            type="button"
                                            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
                                            style={{ color: colors.textMuted }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.border)}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                        >
                                            <FontAwesomeIcon icon={faEllipsis} />
                                        </button>
                                    }
                                    items={[
                                        {
                                            label: "Slet",
                                            icon: faTrash,
                                            danger: true,
                                            onClick: () => setConfirmOpen(true),
                                        },
                                    ]}
                                />
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-4">
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
