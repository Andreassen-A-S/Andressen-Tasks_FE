"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { SortDirection, TaskSortField } from "@/components/tasks/TaskFilterRow";
import { TaskStatus } from "@/types/task";

const DEFAULTS = {
    status: "all" as TaskStatus | "all",
    project: "all",
    assignee: "all",
    creator: "all",
    sort: "created_at" as TaskSortField,
    dir: "desc" as SortDirection,
};

export function useTaskParams() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const taskId = searchParams.get("taskId");

    const rawStatus = searchParams.get("status");
    const statusFilter: TaskStatus | "all" =
        rawStatus === "all" || (rawStatus && (Object.values(TaskStatus) as string[]).includes(rawStatus))
            ? (rawStatus as TaskStatus | "all")
            : DEFAULTS.status;

    const projectFilter = searchParams.get("project") ?? DEFAULTS.project;
    const assigneeFilter = searchParams.get("assignee") ?? DEFAULTS.assignee;
    const creatorFilter = searchParams.get("creator") ?? DEFAULTS.creator;

    const rawSort = searchParams.get("sort");
    const VALID_SORT_FIELDS: TaskSortField[] = ["created_at", "deadline", "start_date", "priority", "title"];
    const sortField: TaskSortField = rawSort && (VALID_SORT_FIELDS as string[]).includes(rawSort)
        ? (rawSort as TaskSortField)
        : DEFAULTS.sort;

    const rawDir = searchParams.get("dir");
    const sortDirection: SortDirection = rawDir === "asc" || rawDir === "desc" ? rawDir : DEFAULTS.dir;

    const setParams = useCallback((updates: Record<string, string | null>, mode: "push" | "replace" = "replace") => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (value === null) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }
        const qs = params.toString();
        const url = qs ? `/tasks?${qs}` : "/tasks";
        if (mode === "push") {
            router.push(url, { scroll: false });
        } else {
            router.replace(url, { scroll: false });
        }
    }, [router, searchParams]);

    const setTaskId = useCallback(
        (id: string | null) => setParams({ taskId: id }, id !== null ? "push" : "replace"),
        [setParams],
    );

    const setStatusFilter = useCallback(
        (v: TaskStatus | "all") => setParams({ status: v === DEFAULTS.status ? null : v }),
        [setParams],
    );

    const setProjectFilter = useCallback(
        (v: string) => setParams({ project: v === DEFAULTS.project ? null : v }),
        [setParams],
    );

    const setAssigneeFilter = useCallback(
        (v: string) => setParams({ assignee: v === DEFAULTS.assignee ? null : v }),
        [setParams],
    );

    const setCreatorFilter = useCallback(
        (v: string) => setParams({ creator: v === DEFAULTS.creator ? null : v }),
        [setParams],
    );

    const setSortField = useCallback(
        (v: TaskSortField) => setParams({ sort: v === DEFAULTS.sort ? null : v }),
        [setParams],
    );

    const setSortDirection = useCallback(
        (v: SortDirection) => setParams({ dir: v === DEFAULTS.dir ? null : v }),
        [setParams],
    );

    const clearFilters = useCallback(
        () => setParams({ status: null, project: null, assignee: null, creator: null, sort: null, dir: null }),
        [setParams],
    );

    return {
        taskId,
        statusFilter,
        projectFilter,
        assigneeFilter,
        creatorFilter,
        sortField,
        sortDirection,
        setTaskId,
        setStatusFilter,
        setProjectFilter,
        setAssigneeFilter,
        setCreatorFilter,
        setSortField,
        setSortDirection,
        clearFilters,
    };
}
