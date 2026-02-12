"use client";

import { useEffect, useMemo, useState, useContext } from "react";
import { getTaskEvents, createComment } from "@/lib/api";
import type { TaskEvent } from "@/types/taskEvent";
import { AuthContext } from "@/contexts/AuthContext";
import SingleAvatar from "../../../label/singleAvatar";
import { formatCommentDate, formatRelativeDate, translateTaskUnit } from "@/helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getSubtaskInfo } from "@/helpers/helpers";
import TaskComment from "../TaskComment";
import TaskTimelineComment from "./TaskTimelineComment";

function isCommentEvent(type: string) {
    return type === "COMMENT_CREATED" || type === "COMMENT_UPDATED" || type === "COMMENT_DELETED";
}

function eventLabel(e: TaskEvent) {
    // Make these read nicely like GitHub
    switch (e.type) {
        case "TASK_CREATED":
            return "oprettede opgaven";
        case "TASK_UPDATED":
            return "opdaterede opgaven";
        case "TASK_STATUS_CHANGED":
            return "ændrede status";
        case "TASK_PRIORITY_CHANGED":
            return "ændrede prioritet";
        case "ASSIGNMENT_CREATED": {
            const assignedUser =
                (e.after_json as any)?.user?.name ||

                "ukendt bruger";
            return `tildelte ${assignedUser}`;
        }
        case "ASSIGNMENT_DELETED": {
            const assignedUser =
                (e.before_json as any)?.user?.name ||
                "ukendt bruger";
            return `fjernede tildelingen af ${assignedUser}`;
        }
        case "PROGRESS_LOGGED": {
            console.log(e);
            const progress =
                (e.progress as any)?.quantity_done ??
                "ukendt fremskridt";
            const unit =
                (e.progress as any)?.unit ??
                "";
            return `loggede fremskridt — ${progress}${unit ? `${translateTaskUnit(unit)}` : ""}`;
        }
        case "SUBTASK_ADDED": {
            const sub = getSubtaskInfo(e);
            return sub.title ? `tilføjede underopgave - “${sub.title}”` : "tilføjede en underopgave";
        }
        case "SUBTASK_REMOVED": {
            const sub = (e.before_json as any)?.title;
            return sub ? `fjernede underopgaven - “${sub}”` : "fjernede en underopgave";
        }
        case "COMMENT_CREATED":
            return "kommenterede";
        case "COMMENT_UPDATED":
            return "redigerede en kommentar";
        case "COMMENT_DELETED":
            return "slettede en kommentar";
        default:
            return e.message || e.type;
    }
}

export default function TaskTimeline({ taskId }: { taskId: string }) {
    const auth = useContext(AuthContext);
    const currentUser = auth?.user;

    const [events, setEvents] = useState<TaskEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function refresh() {
        setLoading(true);
        setError(null);
        try {
            const data = await getTaskEvents(taskId);
            setEvents(data);
        } catch (e) {
            console.error(e);
            setError("Kunne ikke hente aktivitet");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!taskId) return;
        refresh();
    }, [taskId]);


    async function handleSubmitComment(comment: string) {
        if (!comment.trim()) return;
        setSubmitting(true);
        try {
            await createComment(taskId, { message: comment.trim() });
            await refresh();
        } catch (e) {
            console.error(e);
            alert("Kunne ikke tilføje kommentar");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-6">
                <FontAwesomeIcon icon={faSpinner} spin className="text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {error}
            </div>
        );
    }

    return (
        <div>
            {/* Timeline */}
            <div className="relative space-y-4">
                {/* Timeline vertical line */}
                <div className="absolute left-16.75 -top-7.5 -bottom-6 w-0.5 bg-gray-300 z-0" />

                {events.map((e) => {
                    const actorName = e.actor?.name || e.actor?.email || "Ukendt bruger";

                    if (isCommentEvent(e.type)) {
                        return (
                            <div key={e.event_id} className="relative z-10">
                                <TaskTimelineComment
                                    event={e}
                                    actorName={actorName}
                                    label={eventLabel(e)}
                                />
                            </div>
                        );
                    }

                    return (
                        <div
                            key={e.event_id}
                            className="relative z-10 pl-14 flex items-center gap-3"
                        >
                            <SingleAvatar name={actorName} size="xs" />
                            <div className="flex-1">
                                <div className="text-sm text-gray-800">
                                    <span className="font-semibold">{actorName}</span>{" "}
                                    <span className="text-gray-700">{eventLabel(e)}</span>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {` • ${formatCommentDate(e.created_at)}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Composer (GitHub-style bottom box) */}
            <TaskComment
                currentUser={{ name: currentUser?.name, email: currentUser?.email }}
                onSubmit={handleSubmitComment}
                submitting={submitting}
            />
        </div>
    );
}
