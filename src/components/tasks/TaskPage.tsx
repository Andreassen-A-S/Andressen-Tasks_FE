"use client";

import { useCallback, useMemo, useState } from "react";
import { formatNumber } from "@/helpers/helpers";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TaskPriority, TaskStatus } from "@/types/task";
import TaskTable from "./TaskTable";
import TaskFilterRow, { type SortDirection, type TaskSortField } from "./TaskFilterRow";
import TaskCreateModal from "./TaskCreateModal";
import Button from "../common/buttons/Button";
import PageHeader from "@/components/common/PageHeader";
import TableSkeleton from "@/components/common/loading/TableSkeleton";
import { adminQueryKeys, fetchTasksPageData, type TasksPageData } from "@/lib/queries/admin";

export default function TaskPage() {
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createSubmitLabel, setCreateSubmitLabel] = useState("Opret opgave");
    const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
    const [projectFilter, setProjectFilter] = useState<string>("all");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
    const [creatorFilter, setCreatorFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<TaskSortField>("created_at");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const createFormId = "create-task-form";
    const { data, isPending } = useQuery({
        queryKey: adminQueryKeys.tasksPage,
        queryFn: fetchTasksPageData,
    });

    const tasks = useMemo(() => data?.tasks ?? [], [data?.tasks]);
    const projects = useMemo(() => data?.projects ?? [], [data?.projects]);
    const users = useMemo(() => data?.users ?? [], [data?.users]);
    const taskAssignments = useMemo(() => data?.taskAssignments ?? {}, [data?.taskAssignments]);

    const filteredTasks = useMemo(() => {
        const filtered = tasks.filter((task) => {
            if (statusFilter !== "all" && task.status !== statusFilter) return false;
            if (projectFilter !== "all" && task.project_id !== projectFilter) return false;
            if (creatorFilter !== "all" && task.created_by !== creatorFilter) return false;
            if (assigneeFilter !== "all") {
                const assignments = taskAssignments[task.task_id] ?? [];
                if (!assignments.some((assignment) => assignment.user_id === assigneeFilter)) return false;
            }
            return true;
        });

        return [...filtered].sort((a, b) => {
            let result = 0;

            switch (sortField) {
                case "deadline":
                    result = a.deadline.localeCompare(b.deadline);
                    break;
                case "start_date":
                    result = a.start_date.localeCompare(b.start_date);
                    break;
                case "priority": {
                    const order = {
                        [TaskPriority.HIGH]: 3,
                        [TaskPriority.MEDIUM]: 2,
                        [TaskPriority.LOW]: 1,
                    };
                    result = order[a.priority] - order[b.priority];
                    break;
                }
                case "title":
                    result = a.title.localeCompare(b.title, "da");
                    break;
                case "created_at":
                default:
                    result = a.created_at.localeCompare(b.created_at);
                    break;
            }

            return sortDirection === "asc" ? result : -result;
        });
    }, [assigneeFilter, creatorFilter, projectFilter, sortDirection, sortField, statusFilter, taskAssignments, tasks]);

    const handleTaskCreated = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasksPage });
        setShowCreateModal(false);
    }, [queryClient]);

    const handleTaskDeleted = useCallback((taskId: string) => {
        queryClient.setQueryData<TasksPageData>(adminQueryKeys.tasksPage, (current) => {
            if (!current) return current;

            const nextAssignments = { ...current.taskAssignments };
            delete nextAssignments[taskId];

            return {
                ...current,
                tasks: current.tasks.filter((task) => task.task_id !== taskId),
                taskAssignments: nextAssignments,
            };
        });
    }, [queryClient]);

    const clearFilters = useCallback(() => {
        setStatusFilter("all");
        setProjectFilter("all");
        setAssigneeFilter("all");
        setCreatorFilter("all");
    }, []);

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Opgaver"
                subtitle={`${formatNumber(tasks.length)} opgaver`}
                action={
                    <Button
                        variant="primary"
                        size="lg"
                        icon={faPlus}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Ny opgave
                    </Button>
                }
            />

            <div className="mx-8 mt-3 px-4 sm:px-6 lg:px-8 pb-12 flex flex-col gap-3">
                <TaskFilterRow
                    projects={projects}
                    users={users}
                    statusFilter={statusFilter}
                    projectFilter={projectFilter}
                    assigneeFilter={assigneeFilter}
                    creatorFilter={creatorFilter}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onStatusFilterChange={setStatusFilter}
                    onProjectFilterChange={setProjectFilter}
                    onAssigneeFilterChange={setAssigneeFilter}
                    onCreatorFilterChange={setCreatorFilter}
                    onSortFieldChange={setSortField}
                    onSortDirectionChange={setSortDirection}
                    onClearFilters={clearFilters}
                />
                {isPending ? (
                    <TableSkeleton columns={7} rows={8} />
                ) : (
                    <TaskTable
                        tasks={filteredTasks}
                        taskAssignments={taskAssignments}
                        onTaskDelete={handleTaskDeleted}
                    />
                )}

                <TaskCreateModal
                    isOpen={showCreateModal}
                    loading={createLoading}
                    formId={createFormId}
                    submitLabel={createSubmitLabel}
                    onClose={() => setShowCreateModal(false)}
                    onLoadingChange={setCreateLoading}
                    onSubmitLabelChange={setCreateSubmitLabel}
                    onSuccess={handleTaskCreated}
                />
            </div>
        </div>
    );
}
