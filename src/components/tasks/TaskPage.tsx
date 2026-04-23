"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { getAllAssignments, getProjects, getTasks, getUsers } from "@/lib/api";
import { TaskPriority, TaskStatus, type Task } from "@/types/task";
import type { Project } from "@/types/project";
import type { TaskAssignment } from "@/types/assignment";
import type { User } from "@/types/users";
import TaskTable from "./TaskTable";
import TaskFilterRow, { type SortDirection, type TaskSortField } from "./TaskFilterRow";
import TaskCreateModal from "./TaskCreateModal";
import Button from "../common/buttons/Button";
import PageHeader from "@/components/common/PageHeader";

export default function TaskPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [taskAssignments, setTaskAssignments] = useState<Record<string, TaskAssignment[]>>({});
    const [loading, setLoading] = useState(true);
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

    const loadTasks = useCallback(async () => {
        try {
            setLoading(true);
            const [tasksResult, projectsResult, usersResult, assignmentsResult] = await Promise.allSettled([
                getTasks(),
                getProjects(),
                getUsers(),
                getAllAssignments(),
            ]);
            if (tasksResult.status === "fulfilled") setTasks(tasksResult.value);
            if (projectsResult.status === "fulfilled") setProjects(projectsResult.value);
            if (usersResult.status === "fulfilled") setUsers(usersResult.value);
            if (tasksResult.status === "fulfilled" && assignmentsResult.status === "fulfilled") {
                const assignmentMap: Record<string, TaskAssignment[]> = {};
                for (const task of tasksResult.value) {
                    assignmentMap[task.task_id] = [];
                }
                for (const assignment of assignmentsResult.value) {
                    if (assignmentMap[assignment.task_id]) {
                        assignmentMap[assignment.task_id].push(assignment);
                    }
                }
                setTaskAssignments(assignmentMap);
            }
        } catch (error) {
            console.error("Failed to load tasks:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

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
        loadTasks();
        setShowCreateModal(false);
    }, [loadTasks]);

    const handleTaskDeleted = useCallback((taskId: string) => {
        setTasks((prev) => prev.filter((t) => t.task_id !== taskId));
    }, []);

    const clearFilters = useCallback(() => {
        setStatusFilter("all");
        setProjectFilter("all");
        setAssigneeFilter("all");
        setCreatorFilter("all");
    }, []);

    if (loading) {
        return <div className="p-8">Indlæser opgaver...</div>;
    }

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Opgaver"
                subtitle={`${tasks.length} opgaver`}
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
                <TaskTable
                    tasks={filteredTasks}
                    onTaskDelete={handleTaskDeleted}
                />

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
