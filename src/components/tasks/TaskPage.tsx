"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { faCalendar, faClock, faFlag } from "@fortawesome/free-regular-svg-icons";
import {
    faArrowDownWideShort,
    faArrowUpShortWide,
    faCaretDown,
    faClockRotateLeft,
    faFont,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAllAssignments, getProjects, getTasks, getUsers } from "@/lib/api";
import { TaskPriority, TaskStatus, type Task } from "@/types/task";
import type { Project } from "@/types/project";
import type { TaskAssignment } from "@/types/assignment";
import type { User } from "@/types/users";
import TaskList from "./taskList/TaskList";
import CreateTaskForm from "./createTask/CreateTaskForm";
import Modal from "../modal/Modal";
import Drawer from "../drawer/drawer";
import TaskDetails from "./taskDetailsView/TaskDetails";
import Button from "../common/buttons/Button";
import DropdownMenu from "../common/DropdownMenu";
import FilterBar from "../common/table/FilterBar";

type SortField = "created_at" | "deadline" | "start_date" | "priority" | "title";
type SortDirection = "asc" | "desc";

const statusLabelMap: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: "Mangler",
    [TaskStatus.IN_PROGRESS]: "I gang",
    [TaskStatus.DONE]: "Udført",
    [TaskStatus.REJECTED]: "Annulleret",
    [TaskStatus.ARCHIVED]: "Arkiveret",
};

const sortFieldLabelMap: Record<SortField, string> = {
    created_at: "Seneste",
    deadline: "Deadline",
    start_date: "Startdato",
    priority: "Prioritet",
    title: "Titel",
};

export default function TaskPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [taskAssignments, setTaskAssignments] = useState<Record<string, TaskAssignment[]>>({});
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createSubmitLabel, setCreateSubmitLabel] = useState("Opret opgave");
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
    const [projectFilter, setProjectFilter] = useState<string>("all");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
    const [creatorFilter, setCreatorFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const createFormId = "create-task-form";

    const selectedProjectLabel = projectFilter === "all"
        ? "Alle projekter"
        : projects.find((project) => project.project_id === projectFilter)?.name ?? "Alle projekter";
    const selectedAssigneeLabel = assigneeFilter === "all"
        ? "Alle"
        : users.find((user) => user.user_id === assigneeFilter)?.name ?? "Alle";
    const selectedCreatorLabel = creatorFilter === "all"
        ? "Alle"
        : users.find((user) => user.user_id === creatorFilter)?.name ?? "Alle";
    const selectedStatusLabel = statusFilter === "all"
        ? "Alle"
        : statusLabelMap[statusFilter];

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

    const anyFiltersActive =
        statusFilter !== "all" ||
        projectFilter !== "all" ||
        assigneeFilter !== "all" ||
        creatorFilter !== "all";

    const handleTaskCreated = useCallback(() => {
        loadTasks();
        setShowCreateModal(false);
    }, [loadTasks]);

    const handleTaskDeleted = useCallback((taskId: string) => {
        setTasks((prev) => prev.filter((t) => t.task_id !== taskId));
    }, []);

    const handleDrawerClose = useCallback(() => {
        setSelectedTaskId(null);
    }, []);

    if (loading) {
        return <div className="p-8">Indlæser opgaver...</div>;
    }

    return (
        <div className="min-h-screen">
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="h1 flex items-center gap-3">
                            Opgaver
                        </h1>
                        <p className="body-sm">
                            {tasks.length} opgaver
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="lg"
                        icon={faPlus}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Ny opgave
                    </Button>
                </div>
            </div>

            <div className="mx-8 mt-3 px-4 sm:px-6 lg:px-8 pb-12 flex flex-col gap-3">
                <FilterBar
                    left={
                        <>
                            <DropdownMenu
                                trigger={
                                    <Button variant="ghost" size="md" className="-ml-1">
                                        Status: {selectedStatusLabel}
                                        <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                                    </Button>
                                }
                                items={[
                                    { label: "Alle", checked: statusFilter === "all", onClick: () => setStatusFilter("all") },
                                    { label: "Mangler", checked: statusFilter === TaskStatus.PENDING, onClick: () => setStatusFilter(TaskStatus.PENDING) },
                                    { label: "I gang", checked: statusFilter === TaskStatus.IN_PROGRESS, onClick: () => setStatusFilter(TaskStatus.IN_PROGRESS) },
                                    { label: "Udført", checked: statusFilter === TaskStatus.DONE, onClick: () => setStatusFilter(TaskStatus.DONE) },
                                    { label: "Annulleret", checked: statusFilter === TaskStatus.REJECTED, onClick: () => setStatusFilter(TaskStatus.REJECTED) },
                                    { label: "Arkiveret", checked: statusFilter === TaskStatus.ARCHIVED, onClick: () => setStatusFilter(TaskStatus.ARCHIVED) },
                                ]}
                            />
                            {projects.length > 0 && (
                                <DropdownMenu
                                    trigger={
                                        <Button variant="ghost" size="md">
                                            Projekt: {selectedProjectLabel}
                                            <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                                        </Button>
                                    }
                                    items={[
                                        { label: "Alle projekter", checked: projectFilter === "all", onClick: () => setProjectFilter("all") },
                                        ...projects.map((project) => ({
                                            label: project.name,
                                            checked: projectFilter === project.project_id,
                                            onClick: () => setProjectFilter(project.project_id),
                                        })),
                                    ]}
                                />
                            )}
                            <DropdownMenu
                                trigger={
                                    <Button variant="ghost" size="md">
                                        Tildelte: {selectedAssigneeLabel}
                                        <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                                    </Button>
                                }
                                items={[
                                    { label: "Alle", checked: assigneeFilter === "all", onClick: () => setAssigneeFilter("all") },
                                    ...users.map((user) => ({ label: user.name, checked: assigneeFilter === user.user_id, onClick: () => setAssigneeFilter(user.user_id) })),
                                ]}
                            />
                            <DropdownMenu
                                trigger={
                                    <Button variant="ghost" size="md">
                                        Oprettet af: {selectedCreatorLabel}
                                        <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                                    </Button>
                                }
                                items={[
                                    { label: "Alle", checked: creatorFilter === "all", onClick: () => setCreatorFilter("all") },
                                    ...users.map((user) => ({ label: user.name, checked: creatorFilter === user.user_id, onClick: () => setCreatorFilter(user.user_id) })),
                                ]}
                            />
                        </>
                    }
                    right={
                        <>
                            {anyFiltersActive && (
                                <Button variant="ghost" size="md" onClick={() => { setStatusFilter("all"); setProjectFilter("all"); setAssigneeFilter("all"); setCreatorFilter("all"); }}>
                                    Ryd filtre
                                </Button>
                            )}
                            <DropdownMenu
                                trigger={
                                    <Button variant="ghost" size="md" className="-mr-1">
                                        <FontAwesomeIcon icon={sortDirection === "asc" ? faArrowUpShortWide : faArrowDownWideShort} className="w-4 h-4" />
                                        {sortFieldLabelMap[sortField]}
                                        <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                                    </Button>
                                }
                                items={[
                                    { label: "Seneste", icon: faClockRotateLeft, checked: sortField === "created_at", onClick: () => setSortField("created_at") },
                                    { label: "Deadline", icon: faClock, checked: sortField === "deadline", onClick: () => setSortField("deadline") },
                                    { label: "Startdato", icon: faCalendar, checked: sortField === "start_date", onClick: () => setSortField("start_date") },
                                    { label: "Prioritet", icon: faFlag, checked: sortField === "priority", onClick: () => setSortField("priority") },
                                    { label: "Titel", icon: faFont, checked: sortField === "title", onClick: () => setSortField("title") },
                                    { label: "Stigende", icon: faArrowUpShortWide, checked: sortDirection === "asc", dividerBefore: true, onClick: () => setSortDirection("asc") },
                                    { label: "Faldende", icon: faArrowDownWideShort, checked: sortDirection === "desc", onClick: () => setSortDirection("desc") },
                                ]}
                            />
                        </>
                    }
                />
                <TaskList
                    tasks={filteredTasks}
                    onTaskDelete={handleTaskDeleted}
                />

                <Drawer open={!!selectedTaskId} onClose={handleDrawerClose}>
                    {selectedTaskId && (
                        <TaskDetails taskId={selectedTaskId} onClose={handleDrawerClose} />
                    )}
                </Drawer>

                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Opret Ny Opgave"
                    maxWidth="3xl"
                    footer={
                        <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                            <Button
                                type="submit"
                                form={createFormId}
                                loading={createLoading}
                                variant="primary"
                                size="md"
                            >
                                {createSubmitLabel}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                disabled={createLoading}
                                variant="secondary"
                                size="md"
                            >
                                Annuller
                            </Button>
                        </div>
                    }
                >
                    <CreateTaskForm
                        formId={createFormId}
                        onLoadingChange={setCreateLoading}
                        onSubmitLabelChange={setCreateSubmitLabel}
                        onSuccess={handleTaskCreated}
                        onComplete={handleTaskCreated}
                    />
                </Modal>
            </div>
        </div>
    );
}
