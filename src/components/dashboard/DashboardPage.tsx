"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { TaskStatus } from "@/types/task";
import { adminQueryKeys, fetchTasksPageData } from "@/lib/queries/admin";
import { getTaskComments } from "@/lib/api";
import { colors } from "@/constants/colors";
import { toDateKey } from "@/helpers/helpers";
import type { CommentWithTask } from "./DashboardCommentsPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faCompress, faRotateRight, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/common/buttons/Button";
import DropdownMenu from "@/components/common/DropdownMenu";
import DashboardColumn from "./DashboardColumn";
import DashboardCommentsPanel from "./DashboardCommentsPanel";

const INACTIVE_STATUSES = [TaskStatus.DONE, TaskStatus.REJECTED, TaskStatus.ARCHIVED];
const WINDOW_OPTIONS = [3, 7, 14] as const;
type WindowDays = typeof WINDOW_OPTIONS[number];

function addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

export default function DashboardPage() {
    const { isAuthenticated } = useAuth();

    const [windowDays, setWindowDays] = useState<WindowDays>(() => {
        if (typeof window === "undefined") return 7;
        const stored = Number(localStorage.getItem("dashboard_window")) as WindowDays;
        return WINDOW_OPTIONS.includes(stored) ? stored : 7;
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [clock, setClock] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    const { data, isFetching, dataUpdatedAt, refetch } = useQuery({
        queryKey: adminQueryKeys.dashboard,
        queryFn: fetchTasksPageData,
        refetchInterval: 5 * 60 * 1000,
        enabled: isAuthenticated,
    });

    const tasks = data?.tasks ?? [];
    const projectMap = Object.fromEntries((data?.projects ?? []).map(p => [p.project_id, p]));
    const assignmentMap = data?.taskAssignments ?? {};

    const taskIds = tasks.map(t => t.task_id);

    const { data: todayComments = [], refetch: refetchComments } = useQuery({
        queryKey: [...adminQueryKeys.dashboard, "comments", [...taskIds].sort().join(",")],
        queryFn: async () => {
            const today = toDateKey(new Date());
            const results = await Promise.all(
                tasks.map(t => getTaskComments(t.task_id).then(comments =>
                    comments
                        .filter(c => toDateKey(c.created_at) === today && c.message)
                        .map(c => ({ ...c, task: t }))
                ).catch(() => []))
            );
            return results.flat().sort((a, b) => b.created_at.localeCompare(a.created_at)) as CommentWithTask[];
        },
        enabled: isAuthenticated && taskIds.length > 0,
        refetchInterval: 5 * 60 * 1000,
    });

    const today = toDateKey(clock);
    const windowEnd = toDateKey(addDays(clock, windowDays));

    const upcoming = tasks
        .filter(t =>
            toDateKey(t.start_date) > today &&
            toDateKey(t.deadline) <= windowEnd &&
            !INACTIVE_STATUSES.includes(t.status)
        )
        .sort((a, b) => a.start_date.localeCompare(b.start_date));

    const active = tasks
        .filter(t =>
            toDateKey(t.start_date) <= today &&
            toDateKey(t.deadline) >= today &&
            !INACTIVE_STATUSES.includes(t.status)
        )
        .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const overdue = tasks
        .filter(t =>
            toDateKey(t.deadline) < today &&
            !INACTIVE_STATUSES.includes(t.status)
        )
        .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const doneToday = tasks
        .filter(t => {
            if (t.status !== TaskStatus.DONE) return false;
            const doneAt = t.completed_at ?? t.updated_at;
            return toDateKey(doneAt) === today;
        })
        .sort((a, b) => {
            const aAt = a.completed_at ?? a.updated_at;
            const bAt = b.completed_at ?? b.updated_at;
            return bAt.localeCompare(aAt);
        });

    function handleWindowChange(days: WindowDays) {
        setWindowDays(days);
        localStorage.setItem("dashboard_window", String(days));
    }

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch {
            // browser denied fullscreen (permissions, missing user gesture, etc.)
        }
    }

    const lastUpdated = dataUpdatedAt
        ? new Date(dataUpdatedAt).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })
        : null;

    return (
        <div className="flex flex-col h-screen" style={{ backgroundColor: colors.eggWhite }}>
            <div
                className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
                style={{ backgroundColor: colors.white, borderColor: colors.border }}
            >
                <div className="flex items-center gap-3">
                    <span className="h3" style={{ color: colors.textPrimary }}>Andreassen TMS</span>
                    <span className="mono-xs" style={{ color: colors.textMuted }}>Dashboard</span>
                </div>

                <div className="flex items-center gap-4">
                    {lastUpdated && (
                        <span className="mono-xs" style={{ color: colors.textMuted }}>
                            Opdateret {lastUpdated}
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        icon={faRotateRight}
                        onClick={() => { refetch(); refetchComments(); }}
                        className={isFetching ? "animate-spin" : ""}
                    />

                    <span className="mono-xs tabular-nums w-16 text-right" style={{ color: colors.textPrimary }}>
                        {clock.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>

                    <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        icon={isFullscreen ? faCompress : faExpand}
                        onClick={toggleFullscreen}
                    />
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden min-h-0">
                <DashboardColumn
                    title="Kommende"
                    tasks={upcoming}
                    projectMap={projectMap}
                    assignmentMap={assignmentMap}
                    variant="upcoming"
                    action={
                        <DropdownMenu
                            trigger={
                                <Button variant="ghost" size="sm">
                                    {windowDays}d
                                    <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                                </Button>
                            }
                            items={WINDOW_OPTIONS.map(d => ({
                                label: `${d} dage`,
                                checked: windowDays === d,
                                onClick: () => handleWindowChange(d),
                            }))}
                        />
                    }
                />
                <DashboardColumn
                    title="Aktive"
                    tasks={active}
                    projectMap={projectMap}
                    assignmentMap={assignmentMap}
                    variant="active"
                />
                <DashboardColumn
                    title="Overskredet"
                    tasks={overdue}
                    projectMap={projectMap}
                    assignmentMap={assignmentMap}
                    variant="overdue"
                />
                <DashboardColumn
                    title="Udført i dag"
                    tasks={doneToday}
                    projectMap={projectMap}
                    assignmentMap={assignmentMap}
                    variant="done"
                />
            </div>

            <DashboardCommentsPanel comments={todayComments} />
        </div>
    );
}
