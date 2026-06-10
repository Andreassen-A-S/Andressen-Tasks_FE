"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { TaskStatus } from "@/types/task";
import { adminQueryKeys } from "@/lib/queries/admin";
import { getDashboardData } from "@/lib/api";
import { colors } from "@/constants/colors";
import { toDateKey, formatNumber } from "@/helpers/helpers";
import { Maximize2, Minimize2, RotateCw, ChevronDown } from "lucide-react";
import Button from "@/components/common/buttons/Button";
import DropdownMenu from "@/components/common/DropdownMenu";
import Banner from "@/components/common/Banner";
import InlineLoadingState from "@/components/common/loading/InlineLoadingState";
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

    const { data, isFetching, isPending, isError, dataUpdatedAt, refetch } = useQuery({
        queryKey: adminQueryKeys.dashboard,
        queryFn: getDashboardData,
        refetchInterval: 5 * 60 * 1000,
        enabled: isAuthenticated,
    });

    const tasks = data?.tasks ?? [];
    const projectMap = Object.fromEntries((data?.projects ?? []).map(p => [p.project_id, p]));
    const assignments = data?.assignments ?? [];
    const assignmentMap = Object.fromEntries(
        tasks.map(t => [t.task_id, assignments.filter(a => a.task_id === t.task_id)])
    );
    const todayComments = data?.todayComments ?? [];

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
        <div className="flex flex-col h-screen" style={{ backgroundColor: colors.white }}>
            <div
                className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
                style={{ backgroundColor: colors.white, borderColor: colors.border }}
            >
                <div className="flex items-center gap-3">
                    <span className="h3" style={{ color: colors.textPrimary }}>MesterPlan</span>
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
                        icon={<RotateCw className="w-4 h-4" />}
                        disabled={isFetching}
                        onClick={() => refetch()}
                    />

                    <span className="mono-xs tabular-nums w-16 text-right" style={{ color: colors.textPrimary }}>
                        {clock.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>

                    <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        onClick={toggleFullscreen}
                    />
                </div>
            </div>

            {isError && (
                <div className="px-6 pt-4 flex-shrink-0">
                    <Banner
                        variant="warning"
                        title="Data kunne ikke indlæses"
                        action={<Button variant="secondary" size="sm" onClick={() => refetch()}>Prøv igen</Button>}
                    >
                        Dashboard-data kunne ikke hentes. Prøv igen, eller genindlæs siden.
                    </Banner>
                </div>
            )}

            {isPending ? (
                <div className="flex flex-1 items-center justify-center">
                    <InlineLoadingState centered />
                </div>
            ) : (
                <>
                    <div className="flex flex-1 overflow-hidden min-h-0 gap-3 px-3 pt-3">
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
                                            {formatNumber(windowDays)}d
                                            <ChevronDown className="w-3 h-3" />
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
                </>
            )}
        </div>
    );
}
