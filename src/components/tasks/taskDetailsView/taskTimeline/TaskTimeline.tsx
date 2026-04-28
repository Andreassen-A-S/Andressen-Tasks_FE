"use client";

import { useEffect, useState, useContext } from "react";
import { getTaskEvents, createComment, deleteComment } from "@/lib/api";
import type { TaskEvent } from "@/types/taskEvent";
import { AuthContext } from "@/contexts/AuthContext";
import { UserRole } from "@/types/users";
import { toast } from "sonner";
import SingleAvatar from "../../../common/label/SingleAvatar";
import { formatCommentDate, formatNumber, translateStatusLowercase, translateTaskUnit } from "@/helpers/helpers";
import { getSubtaskInfo } from "@/helpers/helpers";
import TaskComment from "../TaskComment";
import TaskTimelineComment from "./TaskTimelineComment";
import InlineLoadingState from "@/components/common/loading/InlineLoadingState";

function isCommentEvent(type: string) {
    return type === "COMMENT_CREATED" || type === "COMMENT_DELETED";
}

function eventLabel(e: TaskEvent) {
    switch (e.type) {
        case "TASK_CREATED": {
            return (
                <>
                    oprettede opgaven{" "}
                </>
            );
        }
        case "TASK_UPDATED": {
            return (
                <>
                    opdaterede opgaven{" "}
                </>
            );
        }
        case "TASK_STATUS_CHANGED": {
            const to = (e.after_json as { status?: string } | null | undefined)?.status;
            return to ? (
                <>
                    ændrede status til{" "}
                    <span className="font-semibold text-[#1B1D22]">
                        {translateStatusLowercase(to)}
                    </span>
                    {" "}
                </>
            ) : (
                <>
                    ændrede <span className="font-semibold text-[#1B1D22]">status</span>
                    {" "}
                </>
            );
        }
        case "TASK_PRIORITY_CHANGED": {
            return (
                <>
                    ændrede <span className="font-semibold text-[#1B1D22]">prioritet</span>
                    {" "}
                </>
            );
        }
        case "ASSIGNMENT_CREATED": {
            const assignedUser =
                (e.after_json as { user?: { name?: string } } | null | undefined)?.user?.name ||
                "ukendt bruger";
            return (
                <>
                    tildelte{" "}
                    <span className="font-semibold text-[#1B1D22]">{assignedUser}</span>
                    {" "}
                </>
            );
        }
        case "ASSIGNMENT_DELETED": {
            const assignedUser =
                (e.before_json as { user?: { name?: string } } | null | undefined)?.user?.name ||
                "ukendt bruger";
            return (
                <>
                    fjernede tildelingen af{" "}
                    <span className="font-semibold text-[#1B1D22]">{assignedUser}</span>
                    {" "}
                </>
            );
        }
        case "PROGRESS_LOGGED": {
            const prog = e.progress as { quantity_done?: number | string; unit?: string } | null | undefined;
            const progress = prog?.quantity_done ?? "ukendt fremskridt";
            const unitLabel = prog?.unit ? translateTaskUnit(prog.unit) : "";
            const progressLabel = `${formatNumber(progress)}${unitLabel ? ` ${unitLabel}` : ""}`;
            return (
                <>
                    loggede fremskridt {" "}
                    <span className="font-semibold text-[#1B1D22]">
                        {progressLabel}
                    </span>
                    {" "}
                </>
            );
        }
        case "SUBTASK_ADDED": {
            const sub = getSubtaskInfo(e);
            return sub.title ? (
                <>
                    tilføjede underopgave {" "}
                    <span className="font-semibold text-[#1B1D22]">“{sub.title}”</span>
                    {" "}
                </>
            ) : (
                <>
                    tilføjede <span className="font-semibold text-[#1B1D22]">en underopgave</span>
                    {" "}
                </>
            );
        }
        case "SUBTASK_REMOVED": {
            const sub = (e.before_json as { title?: string } | null | undefined)?.title;
            return sub ? (
                <>
                    fjernede underopgaven{" "}
                    <span className="font-semibold text-[#1B1D22]">“{sub}”</span>
                    {" "}
                </>
            ) : (
                <>
                    fjernede <span className="font-semibold text-[#1B1D22]">en underopgave</span>
                    {" "}
                </>
            );
        }
        case "COMMENT_CREATED":
            return (
                <>
                    <span className="font-semibold text-[#1B1D22]">kommenterede</span>
                    {" "}
                </>
            );
        case "COMMENT_UPDATED":
            return (
                <>
                    <span className="font-semibold text-[#1B1D22]">redigerede en kommentar</span>
                    {" "}
                </>
            );
        case "COMMENT_DELETED":
            return (
                <>
                    <span className="font-semibold text-[#1B1D22]">slettede en kommentar</span>
                    {" "}
                </>
            );
        default:
            return e.message || e.type;
    }
}

export default function TaskTimeline({ taskId, creatorId, isArchived = false }: { taskId: string; creatorId?: string; isArchived?: boolean }) {
    const auth = useContext(AuthContext);
    const currentUser = auth?.user;

    const [events, setEvents] = useState<TaskEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function refresh(silent = false) {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const data = await getTaskEvents(taskId);
            setEvents(data);
        } catch {
            setError("Kunne ikke hente aktivitet");
        } finally {
            if (!silent) setLoading(false);
        }
    }

    useEffect(() => {
        if (!taskId) return;
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskId]);

    async function handleDeleteComment(commentId: string) {
        try {
            await deleteComment(commentId);
            await refresh(true);
            toast.success("Kommentar slettet");
        } catch {
            toast.error("Kunne ikke slette kommentar. Prøv igen.");
        }
    }

    async function handleUpdateComment() {
        await refresh(true);
    }

    async function handleSubmitComment(message: string, uploadTokens: string[]) {
        if (!message && !uploadTokens.length) return;
        try {
            await createComment(taskId, {
                message: message || undefined,
                upload_tokens: uploadTokens.length ? uploadTokens : undefined,
            });
            await refresh(true);
        } catch {
            throw new Error("Kunne ikke tilføje kommentar. Prøv igen.");
        }
    }

    const editedByMap = new Map<string, string>();
    for (const e of events) {
        if (e.type === "COMMENT_UPDATED" && e.comment_id) {
            editedByMap.set(e.comment_id, e.actor?.name || e.actor?.email || "Ukendt bruger");
        }
    }

    if (loading) {
        return (
            <InlineLoadingState centered className="py-6" />
        );
    }

    if (error) {
        return (
            <div className="bg-[#FDECEC] border border-[#E8E6E1] rounded-[12px] p-3 body-sm text-[#D64545]">
                {error}
            </div>
        );
    }

    return (
        <div>
            {/* Timeline */}
            <div className="relative space-y-4">
                {/* Timeline vertical line */}
                <div className="absolute left-16.75 -top-7.5 -bottom-6 w-0.5 bg-[#E8E6E1] z-0" />

                {events.filter((e) => e.type !== "COMMENT_UPDATED").map((e) => {
                    const actorName = e.actor?.name || e.actor?.email || "Ukendt bruger";

                    if (isCommentEvent(e.type)) {
                        const commentId = e.comment?.comment_id ?? e.comment_id;
                        return (
                            <div key={e.event_id} className="relative z-10">
                                <TaskTimelineComment
                                    event={e}
                                    actorName={actorName}
                                    currentUserId={currentUser?.user_id}
                                    isAdmin={currentUser?.role === UserRole.ADMIN}
                                    isTaskOwner={!!creatorId && e.actor_id === creatorId}
                                    isArchived={isArchived}
                                    editedBy={commentId ? editedByMap.get(commentId) : undefined}
                                    onDelete={handleDeleteComment}
                                    onUpdate={handleUpdateComment}
                                />
                            </div>
                        );
                    }

                    return (
                        <div
                            key={e.event_id}
                            className="relative z-10 pl-14 flex items-center gap-3"
                        >
                            <SingleAvatar name={actorName} size="xs" className="border-2" />
                            <div className="flex-1">
                                <div className="body-sm">
                                    <span className="font-semibold text-[#1B1D22]">{actorName}</span>{" "}
                                    {eventLabel(e)}
                                    <span className="underline">
                                        {`${formatCommentDate(e.created_at)}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Composer (GitHub-style bottom box) */}
            {!isArchived && (
                <TaskComment
                    taskId={taskId}
                    currentUser={{ name: currentUser?.name, email: currentUser?.email }}
                    onSubmit={handleSubmitComment}
                />
            )}
        </div>
    );
}
