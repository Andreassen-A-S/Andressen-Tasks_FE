"use client";

import { useEffect, useState, useContext } from "react";
import { getTaskEvents, createComment, deleteComment } from "@/lib/api";
import type { TaskEvent } from "@/types/taskEvent";
import { AuthContext } from "@/contexts/AuthContext";
import { isAdminRole } from "@/types/users";
import { toast } from "sonner";
import { Plus, Pencil, Calendar, Clock, Flag, MapPinned, SquareChevronUp, Target, UserRound, ChartNoAxesColumnIncreasing, ListTree, Repeat, CircleDot, type LucideIcon } from "lucide-react";
import { colors } from "@/constants/colors";
import SingleAvatar from "../../../common/label/SingleAvatar";
import UserCard from "@/components/common/UserCard";
import { formatCommentDate, formatNumber, translateStatusLowercase, translateTaskUnit } from "@/helpers/helpers";
import { getSubtaskInfo } from "@/helpers/helpers";
import { taskEventDisplay } from "@/constants/taskEventDisplay";
import TaskComment from "../TaskComment";
import TaskTimelineComment from "./TaskTimelineComment";
import InlineLoadingState from "@/components/common/loading/InlineLoadingState";
import Banner from "@/components/common/Banner";
import Button from "@/components/common/buttons/Button";

function isCommentEvent(type: string) {
    return type === "COMMENT_CREATED" || type === "COMMENT_DELETED";
}

function eventIcon(type: string): LucideIcon {
    switch (type) {
        case "TASK_CREATED": return Plus;
        case "TASK_TITLE_CHANGED": return Pencil;
        case "TASK_START_DATE_CHANGED": return Calendar;
        case "TASK_DUE_DATE_CHANGED": return Clock;
        case "TASK_PRIORITY_CHANGED": return Flag;
        case "TASK_PROJECT_CHANGED": return MapPinned;
        case "TASK_STATUS_CHANGED": return SquareChevronUp;
        case "TASK_GOAL_SET": return Target;
        case "TASK_GOAL_REMOVED": return Target;
        case "ASSIGNMENT_CREATED": return UserRound;
        case "ASSIGNMENT_DELETED": return UserRound;
        case "PROGRESS_LOGGED": return ChartNoAxesColumnIncreasing;
        case "SUBTASK_ADDED": return ListTree;
        case "SUBTASK_REMOVED": return ListTree;
        case "RECURRING_INSTANCE_GENERATED": return Repeat;
        default: return CircleDot;
    }
}

function bold(text: string) {
    return <span className="font-semibold text-text-primary">{text}</span>;
}

function eventLabel(e: TaskEvent) {
    switch (e.type) {
        case "TASK_CREATED":
            return <>oprettede opgaven </>;
        case "TASK_TITLE_CHANGED": {
            const title = (e.after_json as { title?: string } | null | undefined)?.title;
            return title ? <>ændrede titlen til {bold(`”${title}”`)} </> : <>ændrede {bold("titlen")} </>;
        }
        case "TASK_DUE_DATE_CHANGED": {
            const raw = (e.after_json as { deadline?: string } | null | undefined)?.deadline;
            const formatted = raw ? new Date(raw).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" }) : null;
            return formatted ? <>ændrede deadline til {bold(formatted)} </> : <>ændrede {bold("deadline")} </>;
        }
        case "TASK_START_DATE_CHANGED": {
            const raw = (e.after_json as { start_date?: string } | null | undefined)?.start_date;
            const formatted = raw ? new Date(raw).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" }) : null;
            return formatted ? <>ændrede startdato til {bold(formatted)} </> : <>ændrede {bold("startdato")} </>;
        }
        case "TASK_PRIORITY_CHANGED": {
            const to = (e.after_json as { priority?: string } | null | undefined)?.priority;
            return to ? <>ændrede prioritet til {bold(to.toLowerCase())} </> : <>ændrede {bold("prioritet")} </>;
        }
        case "TASK_PROJECT_CHANGED":
            return <>flyttede opgaven til et {bold("nyt projekt")} </>;
        case "TASK_GOAL_SET": {
            const after = e.after_json as { target_quantity?: number | null; unit?: string } | null | undefined;
            const unitLabel = after?.unit ? ` ${translateTaskUnit(after.unit)}` : "";
            const qty = after?.target_quantity;
            return qty != null ? <>satte et mål på {bold(`${formatNumber(qty)}${unitLabel}`)} </> : <>satte et {bold("mål")} </>;
        }
        case "TASK_GOAL_REMOVED":
            return <>fjernede {bold("målet")} </>;
        case "TASK_STATUS_CHANGED": {
            const to = (e.after_json as { status?: string } | null | undefined)?.status;
            return to ? <>ændrede status til {bold(translateStatusLowercase(to))} </> : <>ændrede {bold("status")} </>;
        }
        case "ASSIGNMENT_CREATED": {
            const name = (e.after_json as { user?: { name?: string } } | null | undefined)?.user?.name || "ukendt bruger";
            return <>tildelte {bold(name)} </>;
        }
        case "ASSIGNMENT_DELETED": {
            const name = (e.before_json as { user?: { name?: string } } | null | undefined)?.user?.name || "ukendt bruger";
            return <>fjernede tildelingen af {bold(name)} </>;
        }
        case "PROGRESS_LOGGED": {
            const prog = e.progress as { quantity_done?: number | string; unit?: string } | null | undefined;
            const quantity = prog?.quantity_done ?? "ukendt";
            const unitLabel = prog?.unit ? translateTaskUnit(prog.unit) : "";
            return <>loggede fremskridt {bold(`${formatNumber(quantity)}${unitLabel ? ` ${unitLabel}` : ""}`)} </>;
        }
        case "SUBTASK_ADDED": {
            const sub = getSubtaskInfo(e);
            return sub.title ? <>tilføjede underopgave {bold(`”${sub.title}”`)} </> : <>tilføjede {bold("en underopgave")} </>;
        }
        case "SUBTASK_REMOVED": {
            const title = (e.before_json as { title?: string } | null | undefined)?.title;
            return title ? <>fjernede underopgaven {bold(`”${title}”`)} </> : <>fjernede {bold("en underopgave")} </>;
        }
        case "COMMENT_CREATED":
            return <>{bold("kommenterede")} </>;
        case "COMMENT_DELETED":
            return <>{bold("slettede en kommentar")} </>;
        case "RECURRING_INSTANCE_GENERATED":
            return <>Systemet genererede denne opgave fra en {bold("gentagende skabelon")} </>;
        default:
            return <>{e.type} </>;
    }
}

export default function TaskTimeline({ taskId, creatorId, assigneeIds = [], isArchived = false }: { taskId: string; creatorId?: string; assigneeIds?: string[]; isArchived?: boolean }) {
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
            <Banner
                variant="warning"
                title="Aktivitet kunne ikke indlæses"
                action={<Button variant="secondary" onClick={() => void refresh()}>Prøv igen</Button>}
            >
                {error}
            </Banner>
        );
    }

    return (
        <div>
            {/* Timeline */}
            <div className="relative space-y-6">
                {/* Timeline vertical line */}
                <div className="absolute left-20 -translate-x-1/2 -top-7.5 -bottom-12 w-0.5 bg-border z-0" />

                {events.filter((e) => taskEventDisplay[e.type] === "timeline").map((e) => {
                    const actorName = e.actor?.name || e.actor?.email || "Ukendt bruger";

                    if (isCommentEvent(e.type)) {
                        const commentId = e.comment?.comment_id ?? e.comment_id;
                        return (
                            <div key={e.event_id} className="relative z-10">
                                <TaskTimelineComment
                                    event={e}
                                    actorName={actorName}
                                    currentUserId={currentUser?.user_id}
                                    isAdmin={isAdminRole(currentUser?.role)}
                                    isTaskOwner={!!creatorId && e.actor_id === creatorId}
                                    isAssignee={assigneeIds.includes(e.actor_id ?? "")}
                                    isArchived={isArchived}
                                    editedBy={commentId ? editedByMap.get(commentId) : undefined}
                                    onDelete={handleDeleteComment}
                                    onUpdate={handleUpdateComment}
                                />
                            </div>
                        );
                    }

                    const Icon = eventIcon(e.type);
                    return (
                        <div
                            key={e.event_id}
                            className="relative z-10 pl-26 flex items-center"
                        >
                            <div
                                className="absolute left-20 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface flex items-center justify-center ring-3 ring-background"
                                style={{ color: colors.textMuted }}
                            >
                                <Icon
                                    className="w-4 h-4"
                                    style={e.type === "TASK_STATUS_CHANGED" ? { transform: "rotate(180deg)" } : undefined}
                                />
                            </div>
                            <div className="flex-1 body-sm flex items-center gap-1">
                                {e.actor_id ? (
                                    <UserCard userId={e.actor_id} name={actorName} actor={e.actor}>
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
                                {eventLabel(e)}
                                <span className="underline">{formatCommentDate(e.created_at)}</span>
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
                />
            )}
        </div>
    );
}
