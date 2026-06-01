import {
    Plus, Pencil, Calendar, Clock, Flag, MapPinned,
    SquareChevronUp, Target, UserRound, ChartNoAxesColumnIncreasing,
    ListTree, Repeat, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { TaskEvent } from "@/types/taskEvent";
import { TaskPriority, TaskStatus } from "@/types/task";
import { formatNumber, translateTaskUnit } from "@/helpers/helpers";
import Badge from "@/components/common/label/Badge";
import UserCard from "@/components/common/UserCard";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventDisplayKind = "timeline" | "inline" | "audit";

// Single translated event ready for rendering.
// `raw` is kept so the grouping layer can read before/after_json without re-querying.
export type TimelineDisplayItem = {
    id: string;
    kind: EventDisplayKind;
    type: string;
    actorId: string | null;
    actorName: string;
    text: ReactNode;
    icon: LucideIcon;
    rotateIcon: boolean;
    createdAt: string;
    raw: TaskEvent;
};

// After grouping, `text` is replaced with the summarised version and
// `groupedItems` holds all the individual events that were collapsed.
export type GroupedDisplayEvent = TimelineDisplayItem & {
    groupedItems?: TimelineDisplayItem[];
};

// ─── Maps ─────────────────────────────────────────────────────────────────────

export const taskEventIconMap: Record<string, LucideIcon> = {
    TASK_CREATED: Plus,
    TASK_TITLE_CHANGED: Pencil,
    TASK_START_DATE_CHANGED: Calendar,
    TASK_DUE_DATE_CHANGED: Clock,
    TASK_PRIORITY_CHANGED: Flag,
    TASK_PROJECT_CHANGED: MapPinned,
    TASK_STATUS_CHANGED: SquareChevronUp,
    TASK_GOAL_SET: Target,
    TASK_GOAL_UPDATED: Target,
    TASK_GOAL_REMOVED: Target,
    ASSIGNMENT_CREATED: UserRound,
    ASSIGNMENT_DELETED: UserRound,
    PROGRESS_LOGGED: ChartNoAxesColumnIncreasing,
    SUBTASK_ADDED: ListTree,
    SUBTASK_REMOVED: ListTree,
    RECURRING_INSTANCE_GENERATED: Repeat,
};

export const taskEventDisplayMap: Record<string, EventDisplayKind> = {
    TASK_CREATED: "audit",
    TASK_TITLE_CHANGED: "timeline",
    TASK_DESCRIPTION_CHANGED: "inline",
    TASK_START_DATE_CHANGED: "timeline",
    TASK_DUE_DATE_CHANGED: "timeline",
    TASK_PRIORITY_CHANGED: "timeline",
    TASK_PROJECT_CHANGED: "timeline",
    TASK_STATUS_CHANGED: "timeline",
    TASK_GOAL_SET: "timeline",
    TASK_GOAL_UPDATED: "timeline", // never emitted today — goals are removed+re-created instead
    TASK_GOAL_REMOVED: "timeline",
    TASK_DELETED: "audit",
    ASSIGNMENT_CREATED: "timeline",
    ASSIGNMENT_DELETED: "timeline",
    COMMENT_CREATED: "timeline",
    COMMENT_UPDATED: "inline",
    COMMENT_DELETED: "timeline",
    PROGRESS_LOGGED: "timeline",
    SUBTASK_ADDED: "timeline",
    SUBTASK_REMOVED: "timeline",
    RECURRING_TEMPLATE_CREATED: "audit",
    RECURRING_TEMPLATE_UPDATED: "audit",
    RECURRING_TEMPLATE_DEACTIVATED: "audit",
    RECURRING_INSTANCE_GENERATED: "timeline",
};

// ─── Public API ───────────────────────────────────────────────────────────────

// Step 1: convert one raw TaskEvent into one display item.
export function translateTaskEvent(event: TaskEvent): TimelineDisplayItem {
    const actorName = event.actor?.name ?? event.actor?.email ?? "Ukendt bruger";
    return {
        id: event.event_id,
        kind: (taskEventDisplayMap[event.type] ?? "timeline") as EventDisplayKind,
        type: event.type,
        actorId: event.actor_id ?? null,
        actorName,
        text: getTaskEventText(event),
        icon: taskEventIconMap[event.type] ?? Pencil,
        rotateIcon: event.type === "TASK_STATUS_CHANGED",
        createdAt: event.created_at,
        raw: event,
    };
}

// Step 2: collapse consecutive groupable events from the same actor into one row.
// Only assignment and subtask add/remove are collapsed — field changes and comments
// are always shown individually so the history stays unambiguous.
export function groupTimelineEvents(events: TimelineDisplayItem[]): GroupedDisplayEvent[] {
    const result: GroupedDisplayEvent[] = [];

    for (const event of events) {
        const previous = result[result.length - 1];

        if (
            previous &&
            GROUPABLE_EVENT_TYPES.has(event.type) &&
            previous.type === event.type &&
            previous.actorId === event.actorId &&
            isWithinGroupWindow(previous.createdAt, event.createdAt)
        ) {
            previous.groupedItems = [...(previous.groupedItems ?? [previous]), event];
            previous.text = buildGroupedText(previous.groupedItems);
            continue;
        }

        result.push({ ...event });
    }

    return result;
}

// ─── Grouping internals ───────────────────────────────────────────────────────

// Only these event types make sense to collapse — they're bulk operations
// (e.g. assigning three people at once) where showing each row adds no value.
const GROUPABLE_EVENT_TYPES = new Set([
    "ASSIGNMENT_CREATED",
    "ASSIGNMENT_DELETED",
    "SUBTASK_ADDED",
    "SUBTASK_REMOVED",
]);

// Window is measured from the first event in the group, not the last,
// so a slow bulk operation can't grow the window indefinitely.
const GROUP_WINDOW_MS = 2 * 60 * 1000;

function isWithinGroupWindow(a: string, b: string): boolean {
    return Math.abs(new Date(b).getTime() - new Date(a).getTime()) <= GROUP_WINDOW_MS;
}

// after_json is the full Prisma assignment object with a nested user relation.
function extractAssignedUser(after: Record<string, unknown>): { userId: string | null; name: string | null } {
    const user = (after.user ?? after) as { user_id?: string; name?: string | null; email?: string | null };
    const userId = (typeof after.user_id === "string" ? after.user_id : null) ?? (typeof user.user_id === "string" ? user.user_id : null);
    return { userId, name: user.name ?? user.email ?? null };
}

// name/email are embedded at write time because the assignment row is deleted
// before the event fires, so the relation is unavailable at read time.
function extractRemovedUser(before: Record<string, unknown>): { userId: string | null; name: string | null } {
    const userId = typeof before.user_id === "string" ? before.user_id : null;
    const name = (typeof before.name === "string" ? before.name : null) ?? (typeof before.email === "string" ? before.email : null);
    return { userId, name };
}

function buildGroupedText(items: TimelineDisplayItem[]): ReactNode {
    const type = items[0].type;

    if (type === "ASSIGNMENT_CREATED") {
        const users = items.map(item => extractAssignedUser((item.raw.after_json ?? {}) as Record<string, unknown>));
        return <>tilføjede {renderUserList(users)}</>;
    }

    if (type === "ASSIGNMENT_DELETED") {
        const users = items.map(item => extractRemovedUser((item.raw.before_json ?? {}) as Record<string, unknown>));
        return <>fjernede {renderUserList(users)}</>;
    }

    if (type === "SUBTASK_ADDED") {
        return <>tilføjede {highlight(`${items.length} underopgaver`)}</>;
    }

    if (type === "SUBTASK_REMOVED") {
        return <>fjernede {highlight(`${items.length} underopgaver`)}</>;
    }

    return items[0].text;
}

// ─── Rendering helpers ────────────────────────────────────────────────────────

function renderUserList(users: Array<{ userId: string | null; name: string | null }>): ReactNode {
    if (users.length === 0) return highlight("ukendte brugere");

    const nodes = users.map(({ userId, name }, i) => {
        const displayName = name ?? "ukendt bruger";
        if (!userId) return <span key={i}>{highlight(displayName)}</span>;
        return (
            <UserCard key={userId} userId={userId} name={displayName}>
                <span className="text-text-primary hover:underline cursor-pointer">{displayName}</span>
            </UserCard>
        );
    });

    if (nodes.length === 1) return nodes[0];
    if (nodes.length === 2) return <>{nodes[0]} og {nodes[1]}</>;
    return (
        <>
            {nodes.slice(0, -1).map((node, i) => (
                <span key={i}>{node}, </span>
            ))}
            og {nodes[nodes.length - 1]}
        </>
    );
}

function highlight(text: string): ReactNode {
    return <span className="text-text-primary">{text}</span>;
}

function projectLink(projectId: string | null | undefined, label: string): ReactNode {
    if (!projectId) return highlight(label);
    return (
        <>
            <MapPinned className="w-4 h-auto text-text-primary" />
            <Link href="/projects" className="text-text-primary underline hover:no-underline">
                {label}
            </Link>
        </>
    );
}

// ─── Event text ───────────────────────────────────────────────────────────────

function getTaskEventText(event: TaskEvent): ReactNode {
    const before = (event.before_json ?? {}) as Record<string, unknown>;
    const after = (event.after_json ?? {}) as Record<string, unknown>;

    switch (event.type) {
        case "TASK_CREATED":
            return "oprettede denne opgave";

        case "TASK_TITLE_CHANGED":
            return (
                <>
                    ændrede titlen{" "}
                    <s className="text-text-primary">{String(before.title ?? "")}</s>{" "}
                    <span className="text-text-primary">{String(after.title ?? "")}</span>
                </>
            );

        case "TASK_START_DATE_CHANGED":
            return <>ændrede startdato fra {highlight(formatDate(before.start_date))} til {highlight(formatDate(after.start_date))}</>;

        case "TASK_DUE_DATE_CHANGED":
            return <>ændrede deadline fra {highlight(formatDate(before.deadline))} til {highlight(formatDate(after.deadline))}</>;

        case "TASK_PRIORITY_CHANGED":
            return (
                <>
                    ændrede prioritet fra{" "}
                    <Badge variant="priority" value={before.priority as TaskPriority} size="sm" />{" "}
                    til{" "}
                    <Badge variant="priority" value={after.priority as TaskPriority} size="sm" />
                </>
            );

        case "TASK_PROJECT_CHANGED": {
            const fromId = typeof before.project_id === "string" ? before.project_id : null;
            const toId = typeof after.project_id === "string" ? after.project_id : null;
            const fromName = typeof before.project_name === "string" ? before.project_name : "et gammelt projekt";
            const toName = typeof after.project_name === "string" ? after.project_name : "et nyt projekt";
            if (!fromId) return <>tilføjede opgaven til {projectLink(toId, toName)}</>;
            return <>flyttede opgaven fra {projectLink(fromId, fromName)} til {projectLink(toId, toName)}</>;
        }

        case "TASK_STATUS_CHANGED":
            return (
                <>
                    ændrede status fra{" "}
                    <Badge variant="status" value={before.status as TaskStatus} size="sm" />{" "}
                    til{" "}
                    <Badge variant="status" value={after.status as TaskStatus} size="sm" />
                </>
            );

        case "TASK_GOAL_SET":
            return <>satte et mål på {highlight(formatGoal(after))}</>;

        case "TASK_GOAL_REMOVED":
            return <>fjernede {highlight("målet")}</>;

        case "ASSIGNMENT_CREATED": {
            const { userId, name: userName } = extractAssignedUser(after);
            if (userId === event.actor_id) return <>tilføjede {highlight("sig selv")}</>;
            return <>tilføjede {renderUserList([{ userId, name: userName }])}</>;
        }

        case "ASSIGNMENT_DELETED": {
            const { userId, name: userName } = extractRemovedUser(before);
            if (userId === event.actor_id) return <>fjernede {highlight("sig selv")}</>;
            return <>fjernede {renderUserList([{ userId, name: userName }])}</>;
        }

        case "COMMENT_CREATED":
            return <>{highlight("kommenterede")}</>;

        case "COMMENT_DELETED":
            return <>slettede en {highlight("kommentar")}</>;

        case "PROGRESS_LOGGED": {
            const prog = (event.progress as Record<string, unknown> | null | undefined) ?? after;
            const qty = prog?.quantity_done ?? "ukendt";
            const unit = typeof prog?.unit === "string" ? ` ${translateTaskUnit(prog.unit)}` : "";
            return <>loggede {highlight(`${formatNumber(qty as number | string)}${unit}`)} fremskridt</>;
        }

        case "SUBTASK_ADDED": {
            const subtaskId = typeof after.task_id === "string" ? after.task_id : null;
            const subtaskTitle = typeof after.title === "string" ? after.title : null;
            const subtaskLink = subtaskId
                ? <Link href={`/tasks/${subtaskId}`} className="text-text-primary underline hover:no-underline">{subtaskTitle ?? "en underopgave"}</Link>
                : highlight(subtaskTitle ?? "en underopgave");
            return <>tilføjede underopgave {subtaskLink}</>;
        }

        case "SUBTASK_REMOVED": {
            const subtaskId = typeof before.task_id === "string" ? before.task_id : null;
            const subtaskTitle = typeof before.title === "string" ? before.title : null;
            const subtaskLink = subtaskId
                ? <Link href={`/tasks/${subtaskId}`} className="text-text-primary underline hover:no-underline">{subtaskTitle ?? "en underopgave"}</Link>
                : highlight(subtaskTitle ?? "en underopgave");
            return <>fjernede underopgaven {subtaskLink}</>;
        }

        case "RECURRING_INSTANCE_GENERATED":
            return <>genererede denne opgave fra en {highlight("gentagende skabelon")}</>;

        default:
            return <>{event.message ?? "opdaterede opgaven"}</>;
    }
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatDate(value: unknown): string {
    if (!value) return "ingen";
    try {
        return new Date(String(value)).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
    } catch {
        return String(value);
    }
}

function formatGoal(json: Record<string, unknown>): string {
    const qty = json.target_quantity;
    const unit = json.unit;
    if (qty == null) return "ukendt";
    return `${formatNumber(qty as number | string)}${typeof unit === "string" ? ` ${translateTaskUnit(unit)}` : ""}`;
}
