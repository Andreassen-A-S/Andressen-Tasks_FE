"use client";

import { useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createComment, deleteComment } from "@/lib/api";
import type { TaskEvent } from "@/types/taskEvent";
import type { MentionableUser } from "@/types/users";
import { AuthContext } from "@/contexts/AuthContext";
import { isAdminRole } from "@/types/users";
import { toast } from "sonner";
import { colors } from "@/constants/colors";
import SingleAvatar from "../../../common/label/SingleAvatar";
import UserCard from "@/components/common/UserCard";
import { formatCommentDate } from "@/helpers/helpers";
import { translateTaskEvent, groupTimelineEvents, taskEventDisplayMap } from "@/helpers/taskEventTranslator";
import TaskComment from "../TaskComment";
import TaskTimelineComment from "./TaskTimelineComment";
import InlineLoadingState from "@/components/common/loading/InlineLoadingState";
import Banner from "@/components/common/Banner";
import Button from "@/components/common/buttons/Button";
import { fetchTaskEvents, taskQueryKeys } from "@/lib/queries/tasks";

function isCommentEvent(type: string) {
    return type === "COMMENT_CREATED";
}

export default function TaskTimeline({ taskId, creatorId, assigneeIds = [], isArchived = false, mentionableUsers = [] }: { taskId: string; creatorId?: string; assigneeIds?: string[]; isArchived?: boolean; mentionableUsers?: MentionableUser[] }) {
    const auth = useContext(AuthContext);
    const currentUser = auth?.user;
    const queryClient = useQueryClient();

    const {
        data: events = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: taskQueryKeys.events(taskId),
        queryFn: () => fetchTaskEvents(taskId),
    });

    async function refresh() {
        await queryClient.invalidateQueries({ queryKey: taskQueryKeys.events(taskId) });
    }

    async function handleDeleteComment(commentId: string) {
        try {
            await deleteComment(commentId);
            await refresh();
            toast.success("Kommentar slettet");
        } catch {
            toast.error("Kunne ikke slette kommentar. Prøv igen.");
        }
    }

    async function handleUpdateComment() {
        await refresh();
    }

    async function handleSubmitComment(message: string, uploadTokens: string[], mentionUserIds?: string[]) {
        if (!message && !uploadTokens.length) return;
        try {
            await createComment(taskId, {
                message: message || undefined,
                upload_tokens: uploadTokens.length ? uploadTokens : undefined,
                mention_user_ids: mentionUserIds?.length ? mentionUserIds : undefined,
            });
            await refresh();
        } catch {
            throw new Error("Kunne ikke tilføje kommentar. Prøv igen.");
        }
    }

    // comment_id FK is set to null (onDelete: SetNull) when a comment is deleted.
    // before_json/after_json are unaffected, so we resolve identity from those.
    const resolveCommentId = (e: TaskEvent): string | undefined =>
        e.comment?.comment_id ?? e.comment_id
            ?? (e.before_json as Record<string, unknown> | null)?.comment_id as string | undefined
            ?? (e.after_json as Record<string, unknown> | null)?.comment_id as string | undefined;

    // Maps comment_id → COMMENT_DELETED event (for passing to the original COMMENT_CREATED entry)
    const deletedEventMap = new Map<string, TaskEvent>();
    for (const e of events) {
        if (e.type === "COMMENT_DELETED") {
            const id = resolveCommentId(e);
            if (id) deletedEventMap.set(id, e);
        }
    }

    // Edit history: COMMENT_UPDATED + COMMENT_DELETED, keyed by comment_id.
    // Deletion is appended last so it shows as the final edit entry in the popover.
    const editHistoryMap = new Map<string, TaskEvent[]>();
    for (const e of events) {
        if (e.type === "COMMENT_UPDATED" || e.type === "COMMENT_DELETED") {
            const id = resolveCommentId(e);
            if (id) {
                const existing = editHistoryMap.get(id) ?? [];
                editHistoryMap.set(id, [...existing, e]);
            }
        }
    }

    if (isLoading) {
        return (
            <InlineLoadingState centered className="py-6" />
        );
    }

    if (error) {
        return (
            <Banner
                variant="warning"
                title="Aktivitet kunne ikke indlæses"
                action={<Button variant="secondary" onClick={() => void refetch()}>Prøv igen</Button>}
            >
                {error instanceof Error ? error.message : "Kunne ikke hente aktivitet"}
            </Banner>
        );
    }

    return (
        <div>
            {/* Timeline */}
            <div className="relative space-y-6">
                {/* Timeline vertical line */}
                <div className="absolute left-20 -translate-x-1/2 -top-7.5 -bottom-12 w-0.5 bg-border z-0" />

                {groupTimelineEvents(
                    events
                        .filter((e) => taskEventDisplayMap[e.type] === "timeline")
                        .filter((e) => e.type !== "COMMENT_DELETED")
                        .map((e) => translateTaskEvent(e))
                ).map((item) => {
                    const { actorId, actorName, icon: Icon, rotateIcon, text, raw: e } = item;

                    if (isCommentEvent(item.type)) {
                        const commentId = resolveCommentId(e);
                        const deletedEvent = commentId ? deletedEventMap.get(commentId) : undefined;
                        return (
                            <div key={item.id} className="relative z-10">
                                <TaskTimelineComment
                                    event={e}
                                    actorName={actorName}
                                    deletedEvent={deletedEvent}
                                    currentUserId={currentUser?.user_id}
                                    isAdmin={isAdminRole(currentUser?.role)}
                                    isTaskOwner={!!creatorId && e.actor_id === creatorId}
                                    isAssignee={assigneeIds.includes(e.actor_id ?? "")}
                                    isArchived={isArchived}
                                    editHistory={commentId ? editHistoryMap.get(commentId) : undefined}
                                    mentionableUsers={mentionableUsers}
                                    onDelete={handleDeleteComment}
                                    onUpdate={handleUpdateComment}
                                />
                            </div>
                        );
                    }

                    return (
                        <div
                            key={item.id}
                            className="relative z-10 pl-26 flex items-center"
                        >
                            <div
                                className="absolute left-20 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface flex items-center justify-center ring-3 ring-background"
                                style={{ color: colors.textSecondary }}
                            >
                                <Icon className={rotateIcon ? "w-4 h-4 rotate-180" : "w-4 h-4"} />
                            </div>
                            <div className="flex-1 body-sm flex items-center gap-1">
                                {actorId ? (
                                    <UserCard userId={actorId} name={actorName} actor={e.actor}>
                                        <span className="inline-flex items-center gap-1 shrink-0">
                                            <SingleAvatar name={actorName} size="3xs" className="border border-border" imageUrl={e.actor?.profile_picture_url} />
                                            <span className="font-semibold text-text-primary">{actorName}</span>
                                        </span>
                                    </UserCard>
                                ) : (
                                    <span className="inline-flex items-center gap-1 shrink-0">
                                        <SingleAvatar name={actorName} size="3xs" className="border border-border" imageUrl={e.actor?.profile_picture_url} />
                                        <span className="font-semibold text-text-primary">{actorName}</span>
                                    </span>
                                )}{" "}
                                {text}{" "}
                                <span className="underline" title={new Date(e.created_at).toLocaleString("da-DK", { dateStyle: "long", timeStyle: "short" })}>{formatCommentDate(e.created_at)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Composer (GitHub-style bottom box) */}
            {!isArchived && (
                <TaskComment
                    taskId={taskId}
                    currentUser={{ user_id: currentUser?.user_id, name: currentUser?.name, email: currentUser?.email, profile_picture_url: currentUser?.profile_picture_url }}
                    onSubmit={handleSubmitComment}
                    mentionableUsers={mentionableUsers}
                />
            )}
        </div>
    );
}
