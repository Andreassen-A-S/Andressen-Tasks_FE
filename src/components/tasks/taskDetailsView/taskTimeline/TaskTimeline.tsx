"use client";

import { useEffect, useMemo, useState, useContext } from "react";
import { getTaskEvents, createComment } from "@/lib/api";
import type { TaskEvent } from "@/types/taskEvent";
import { AuthContext } from "@/contexts/AuthContext";
import SingleAvatar from "../../../label/singleAvatar";
import { formatCommentDate } from "@/helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getSubtaskInfo } from "@/helpers/helpers";
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
        case "ASSIGNMENT_CREATED":
            return "tildelte en bruger";
        case "ASSIGNMENT_DELETED":
            return "fjernede en tildeling";
        case "PROGRESS_LOGGED":
            return "loggede fremskridt";
        case "SUBTASK_ADDED": {
            const sub = getSubtaskInfo(e);
            return sub.title ? `tilføjede underopgave — “${sub.title}”` : "tilføjede en underopgave";
        }
        case "SUBTASK_REMOVED": {
            const sub = (e.before_json as any)?.title;
            return sub ? `fjernede underopgaven — “${sub}”` : "fjernede en underopgave";
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

    const [comment, setComment] = useState("");
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskId]);

    const commentCount = useMemo(
        () => events.filter((e) => e.type === "COMMENT_CREATED").length,
        [events]
    );

    async function handleSubmitComment() {
        if (!comment.trim()) return;
        setSubmitting(true);
        try {
            await createComment(taskId, { message: comment.trim() });
            setComment("");
            await refresh(); // simplest: re-fetch timeline so it stays consistent
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
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
                Aktivitet & kommentarer ({commentCount})
            </h2>

            {/* Timeline */}
            <div className="space-y-4">
                {events.map((e) => {
                    const actorName = e.actor?.name || e.actor?.email || "Ukendt bruger";

                    // COMMENT cards
                    if (isCommentEvent(e.type)) {
                        // For deleted comment you may not have comment object depending on how you handle deletion.
                        if (isCommentEvent(e.type)) {
                            return (
                                <TaskTimelineComment
                                    key={e.event_id}
                                    event={e}
                                    actorName={actorName}
                                    label={eventLabel(e)}
                                />
                            );
                        }
                    }

                    // Compact event rows
                    return (
                        <div key={e.event_id} className="flex items-start gap-3">
                            <div className="mt-1">
                                <SingleAvatar name={actorName} size="sm" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-gray-800">
                                    <span className="font-semibold">{actorName}</span>{" "}
                                    <span className="text-gray-700">{eventLabel(e)}</span>

                                </div>
                                <div className="text-xs text-gray-500 mt-1">{formatCommentDate(e.created_at)}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Composer (GitHub-style bottom box) */}
            <div className="mt-8">
                <div className="flex items-start gap-4">
                    <SingleAvatar
                        name={currentUser?.name || currentUser?.email || "Ukendt bruger"}
                        size="sm"
                    />
                    <div className="flex-1">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tilføj en kommentar..."
                            disabled={submitting}
                            className="w-full bg-white border border-gray-300 rounded-2xl px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 resize-none min-h-[120px]
                focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                disabled:bg-gray-50 disabled:text-gray-500"
                        />
                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSubmitComment}
                                disabled={!comment.trim() || submitting}
                                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white
                  hover:bg-green-700 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        Sender...
                                    </>
                                ) : (
                                    "Kommenter"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
