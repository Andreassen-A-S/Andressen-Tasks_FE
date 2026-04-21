"use client";

import { useEffect, useState } from "react";
import { getTask, getUser, getUsers, updateTask, getTaskAssignments, getProjects } from "@/lib/api";
import type { Task } from "@/types/task";
import { TaskStatus, TaskPriority, TaskGoalType, TaskUnit } from "@/types/task";
import type { User } from "@/types/users";
import { formatDateTime, formatDate, translatePriority, translateStatus, getPriorityAccentColors, getStatusAccentColors, translateTaskUnit } from "@/helpers/helpers";
import type { Project } from "@/types/project";

import type { TaskAssignment } from "@/types/assignment";

import Modal from "@/components/modal/Modal";
import CreateTaskForm from "@/components/tasks/createTask/CreateTaskForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faCalendar,
    faEllipsis,
    faImages,
    faTrash,
    faXmark,
    faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";
import Badge from "../../common/label/badge";
import ProjectBadge from "../../common/label/ProjectBadge";
import SingleAvatar from "../../common/label/singleAvatar";
import RecurringBadge from "../../common/label/recurringBadge";
import TaskTimeline from "@/components/tasks/taskDetailsView/taskTimeline/TaskTimeline";
import TaskDescriptionCard from "./TaskDescriptionCard";
import Button from "@/components/common/buttons/Button";
import DropdownMenu from "@/components/common/DropdownMenu";
import DetailsSectionHeader from "@/components/common/DetailsSectionHeader";
import DetailsSinglePicker from "@/components/common/DetailsSinglePicker";
import DetailsMultiPicker from "@/components/common/DetailsMultiPicker";
import DetailsDatePicker from "@/components/common/DetailsDatePicker";
import DetailsGoalEditor from "@/components/common/DetailsGoalEditor";
import { getTaskAttachments } from "@/lib/api";
import { toast } from "sonner";
import { colors } from "@/constants/colors";
import ConfirmModal from "@/components/common/ConfirmModal";


interface TaskDetailsProps {
    taskId: string;
    onClose: () => void;
    onDelete?: (taskId: string) => void;
}

const sc = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

const PRIORITY_OPTIONS = [
    { value: TaskPriority.HIGH, label: translatePriority(TaskPriority.HIGH), color: getPriorityAccentColors(TaskPriority.HIGH) },
    { value: TaskPriority.MEDIUM, label: translatePriority(TaskPriority.MEDIUM), color: getPriorityAccentColors(TaskPriority.MEDIUM) },
    { value: TaskPriority.LOW, label: translatePriority(TaskPriority.LOW), color: getPriorityAccentColors(TaskPriority.LOW) },
];

const STATUS_OPTIONS = [
    TaskStatus.PENDING,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
    TaskStatus.REJECTED,
    TaskStatus.ARCHIVED,
].map((s) => ({ value: s, label: sc(translateStatus(s)), color: getStatusAccentColors(s) }));

export default function TaskDetails({ taskId, onClose, onDelete }: TaskDetailsProps) {
    const [task, setTask] = useState<Task | null>(null);
    const [creator, setCreator] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSubtaskModal, setShowSubtaskModal] = useState(false);
    const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [openPicker, setOpenPicker] = useState<{ key: "project" | "priority" | "status" | "assignee" | "startDate" | "deadline" | "goal"; triggerEl: HTMLButtonElement } | null>(null);

    function togglePicker(key: "project" | "priority" | "status" | "assignee" | "startDate" | "deadline" | "goal", triggerEl: HTMLButtonElement) {
        if (isArchived) return;
        setOpenPicker((current) => current?.key === key ? null : { key, triggerEl });
    }

    function closePicker() {
        setOpenPicker(null);
    }

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setIsLoading(true);
                const [taskData, assignmentData, userData, projectData] = await Promise.all([
                    getTask(taskId),
                    getTaskAssignments(taskId),
                    getUsers(),
                    getProjects(),
                ]);
                setTask(taskData);
                setAssignments(assignmentData);
                setAllUsers(userData);
                setProjects(projectData);
                if (taskData.created_by) {
                    const creatorData = await getUser(taskData.created_by);
                    setCreator(creatorData);
                }
            } catch {
                setError("Kunne ikke hente opgave detaljer");
            } finally {
                setIsLoading(false);
            }
        };

        if (taskId) fetchTask();
    }, [taskId]);

    async function handleDownloadAllImages() {
        if (!task || isDownloading) return;
        setIsDownloading(true);
        try {
            const attachments = await getTaskAttachments(task.task_id);
            const images = attachments.filter((a) => a.type === "IMAGE");
            if (images.length === 0) { toast.info("Ingen billeder at downloade"); return; }
            for (const image of images) {
                const response = await fetch(image.url);
                if (!response.ok) { toast.error(`Kunne ikke hente ${image.file_name ?? "billede"}`); continue; }
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = image.file_name ?? "billede";
                a.style.display = "none";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            }
        } catch {
            toast.error("Kunne ikke hente billeder. Prøv igen.");
        } finally {
            setIsDownloading(false);
        }
    }

    async function handlePrioritySelect(value: string) {
        if (!task) return;
        try {
            const updated = await updateTask(task.task_id, { priority: value as TaskPriority });
            setTask(updated);
        } catch {
            toast.error("Kunne ikke opdatere prioritet");
        }
    }

    async function handleProjectSelect(value: string) {
        if (!task || !value || value === task.project_id) return;
        try {
            const updated = await updateTask(task.task_id, { project_id: value });
            const selectedProject = projects.find((project) => project.project_id === value);
            setTask({
                ...updated,
                project: selectedProject
                    ? { name: selectedProject.name, color: selectedProject.color ?? null }
                    : updated.project,
            });
        } catch {
            toast.error("Kunne ikke opdatere projekt");
        }
    }

    async function handleStatusSelect(value: string) {
        if (!task) return;
        try {
            const updated = await updateTask(task.task_id, { status: value as TaskStatus });
            setTask(updated);
        } catch {
            toast.error("Kunne ikke opdatere status");
        }
    }

    async function handleStartDateSelect(isoDate: string | null) {
        if (!task) return;
        try {
            const updated = await updateTask(task.task_id, { start_date: isoDate ? isoDate + "T00:00:00.000Z" : undefined });
            setTask(updated);
        } catch {
            toast.error("Kunne ikke opdatere startdato");
        }
    }

    async function handleDeadlineSelect(isoDate: string | null) {
        if (!task) return;
        try {
            const updated = await updateTask(task.task_id, { deadline: isoDate ? isoDate + "T00:00:00.000Z" : undefined });
            setTask(updated);
        } catch {
            toast.error("Kunne ikke opdatere deadline");
        }
    }

    async function handleAssigneesSelect(userIds: string[]) {
        if (!task) return;
        try {
            await updateTask(task.task_id, { assigned_users: userIds });
            const updated = await getTaskAssignments(task.task_id);
            setAssignments(updated);
        } catch {
            toast.error("Kunne ikke opdatere tildelte brugere");
        }
    }

    async function handleGoalSave(input: {
        goal_type: TaskGoalType;
        unit?: TaskUnit;
        target_quantity?: number | null;
        current_quantity?: number | null;
    }) {
        if (!task) return;
        try {
            const updated = await updateTask(task.task_id, input);
            setTask(updated);
        } catch {
            toast.error("Kunne ikke opdatere mål");
            throw new Error("goal-update-failed");
        }
    }

    function handleOpenParentTask() {
        if (!task?.parent_task_id) return;
        // TODO: Replace this stub once a dedicated single-task route exists.
        toast.info(`Naviger til overopgave #${task.parent_task_id.slice(0, 8)} når task-routen er implementeret.`);
    }

    async function handleDeleteTask() {
        if (!task) return;
        setDeleteLoading(true);
        try {
            const { deleteTask } = await import("@/lib/api");
            await deleteTask(task.task_id);
            onDelete?.(task.task_id);
            setConfirmDeleteOpen(false);
            onClose();
        } catch {
            toast.error("Kunne ikke slette opgaven. Prøv igen senere.");
        } finally {
            setDeleteLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="body-sm">Indlæser...</span>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-6 bg-red-50 border-b border-red-200">
                    <span className="label-lg text-red-800">{error || "Opgave ikke fundet"}</span>
                </div>
            </div>
        );
    }

    const isArchived = task.status === TaskStatus.ARCHIVED;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Archived banner */}
            {isArchived && (
                <div
                    className="flex items-center gap-2 px-4 py-2"
                    style={{ backgroundColor: colors.muted, borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}
                >
                    <FontAwesomeIcon icon={faBoxArchive} className="text-xs" />
                    <span className="label-sm">Denne opgave er arkiveret og kan ikke redigeres</span>
                </div>
            )}

            {/* Header */}
            <div className="px-8 pt-7 pb-5">
                <div className="flex items-start justify-between mb-3">
                    <h1 className="h1 wrap-break-word">{task.title}</h1>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <DropdownMenu
                            trigger={<Button variant="ghost" size="md" icon={faEllipsis} iconOnly tooltip="Mere" />}
                            items={[
                                {
                                    label: isDownloading ? "Henter billeder..." : "Download alle billeder",
                                    icon: faImages,
                                    onClick: handleDownloadAllImages,
                                },
                                {
                                    label: "Slet",
                                    icon: faTrash,
                                    onClick: () => setConfirmDeleteOpen(true),
                                    danger: true,
                                    dividerBefore: true,
                                },
                            ]}
                        />
                        <Button variant="ghost" size="md" icon={faXmark} iconOnly onClick={onClose} aria-label="Luk" tooltip="Luk" />
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="status" value={task.status} size="lg" />
                    {task.recurring_template_id && <RecurringBadge size="lg" />}
                    {task.project?.name && <ProjectBadge name={task.project.name} size="md" />}
                </div>
            </div>
            <div className="mx-8" style={{ borderTop: `1px solid ${colors.border}` }} />

            <div className="flex flex-1 overflow-y-auto">
                <div className="flex flex-1 px-8 gap-8 min-w-0">
                    {/* Main content */}
                    <div className="flex-1 pt-6 min-w-0">
                        <TaskDescriptionCard
                            creator={creator}
                            createdAt={task.created_at}
                            description={task.description}
                            showSubtaskButton={task.parent_task_id == null}
                            onAddSubtask={() => setShowSubtaskModal(true)}
                            isArchived={isArchived}
                        />
                        <TaskTimeline taskId={task.task_id} creatorId={task.created_by} isArchived={isArchived} />
                        <div className="h-12" />
                    </div>

                    {/* Sidebar */}
                    <div className="w-64 py-6 self-start" style={{ position: "sticky", top: 0 }}>
                        <div>
                            <div>

                                {/* Status */}
                                <DetailsSectionHeader
                                    label="Status"
                                    disabled={isArchived}
                                    isOpen={openPicker?.key === "status"}
                                    onGearClick={(button) => togglePicker("status", button)}
                                    onClose={closePicker}
                                >
                                    <Badge variant="status" value={task.status} />
                                </DetailsSectionHeader>

                                <div style={{ borderTop: `1px solid ${colors.border}`, margin: "12px 0" }} />

                                {/* Project */}
                                <DetailsSectionHeader
                                    label="Projekt"
                                    disabled={isArchived}
                                    isOpen={openPicker?.key === "project"}
                                    onGearClick={(button) => togglePicker("project", button)}
                                    onClose={closePicker}
                                    emptyText="Intet projekt"
                                >
                                    {task.project?.name ? <ProjectBadge name={task.project.name} /> : undefined}
                                </DetailsSectionHeader>

                                <div style={{ borderTop: `1px solid ${colors.border}`, margin: "12px 0" }} />

                                {/* Priority */}
                                <DetailsSectionHeader
                                    label="Prioritet"
                                    disabled={isArchived}
                                    isOpen={openPicker?.key === "priority"}
                                    onGearClick={(button) => togglePicker("priority", button)}
                                    onClose={closePicker}
                                    emptyText="Ingen prioritet"
                                >
                                    {task.priority != null ? <Badge variant="priority" value={task.priority} /> : undefined}
                                </DetailsSectionHeader>

                                <div style={{ borderTop: `1px solid ${colors.border}`, margin: "12px 0" }} />

                                {/* Assignees */}
                                <DetailsSectionHeader
                                    label="Tildelt til"
                                    disabled={isArchived}
                                    isOpen={openPicker?.key === "assignee"}
                                    onGearClick={(button) => togglePicker("assignee", button)}
                                    onClose={closePicker}
                                    emptyText="Ingen tildelt"
                                >
                                    {assignments.length > 0 ? (
                                        <ul className="space-y-2">
                                            {assignments.map((a) => (
                                                <li key={a.user.user_id} className="flex items-center gap-2">
                                                    <SingleAvatar name={a.user.name} size="sm" />
                                                    <div>
                                                        <span className="label-md block">{a.user.name}</span>
                                                        {a.user.position && <span className="body-xs block">{a.user.position}</span>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : undefined}
                                </DetailsSectionHeader>

                                <div style={{ borderTop: `1px solid ${colors.border}`, margin: "12px 0" }} />

                                {/* Start date */}
                                <DetailsSectionHeader
                                    label="Startdato"
                                    disabled={isArchived}
                                    isOpen={openPicker?.key === "startDate"}
                                    onGearClick={(button) => togglePicker("startDate", button)}
                                    onClose={closePicker}
                                    emptyText="Ingen startdato"
                                >
                                    {task.start_date ? (
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faCalendar} className="text-xs" style={{ color: colors.textMuted }} />
                                            <span className="body-sm">{formatDate(task.start_date)}</span>
                                        </div>
                                    ) : undefined}
                                </DetailsSectionHeader>

                                <div style={{ borderTop: `1px solid ${colors.border}`, margin: "12px 0" }} />

                                {/* Deadline */}
                                <DetailsSectionHeader
                                    label="Deadline"
                                    disabled={isArchived}
                                    isOpen={openPicker?.key === "deadline"}
                                    onGearClick={(button) => togglePicker("deadline", button)}
                                    onClose={closePicker}
                                    emptyText="Ingen deadline"
                                >
                                    {task.deadline ? (
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faClock} className="text-xs" style={{ color: colors.textMuted }} />
                                            <span className="body-sm">{formatDate(task.deadline)}</span>
                                        </div>
                                    ) : undefined}
                                </DetailsSectionHeader>

                                {/* Goal */}
                                <div style={{ borderTop: `1px solid ${colors.border}`, margin: "12px 0" }} />
                                <DetailsSectionHeader
                                    label="Mål"
                                    disabled={isArchived}
                                    isOpen={openPicker?.key === "goal"}
                                    onGearClick={(button) => togglePicker("goal", button)}
                                    onClose={closePicker}
                                    emptyText="Intet mål"
                                >
                                    {task.goal_type === "FIXED" && task.target_quantity != null ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="body-xs">Fremskridt</span>
                                                <span className="label-md">
                                                    {task.current_quantity ?? 0} / {task.target_quantity}
                                                    {task.unit ? ` ${translateTaskUnit(task.unit)}` : ""}
                                                </span>
                                            </div>
                                            <div className="w-full rounded-full h-1.5" style={{ backgroundColor: colors.border }}>
                                                <div
                                                    className="h-1.5 rounded-full transition-all"
                                                    style={{
                                                        width: `${Math.min(100, ((task.current_quantity ?? 0) / task.target_quantity) * 100)}%`,
                                                        backgroundColor: colors.green,
                                                    }}
                                                />
                                            </div>
                                            <span className="caption" style={{ display: "block", textAlign: "right" }}>
                                                {Math.round(Math.min(100, ((task.current_quantity ?? 0) / task.target_quantity) * 100))}% fuldført
                                            </span>
                                        </div>
                                    ) : undefined}
                                </DetailsSectionHeader>

                                <div style={{ borderTop: `1px solid ${colors.border}`, margin: "12px 0" }} />

                                {/* Metadata */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="caption">Oprettet</span>
                                        <span className="label-sm" style={{ color: colors.textPrimary }}>{formatDateTime(task.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="caption">Sidst opdateret</span>
                                        <span className="label-sm" style={{ color: colors.textPrimary }}>{formatDateTime(task.updated_at)}</span>
                                    </div>
                                    {task.completed_at && (
                                        <div className="flex justify-between gap-3">
                                            <span className="caption">Fuldført</span>
                                            <span className="label-sm text-right" style={{ color: colors.textPrimary }}>
                                                {formatDateTime(task.completed_at)}
                                            </span>
                                        </div>
                                    )}
                                    {task.parent_task_id && (
                                        <div className="flex justify-between">
                                            <span className="caption">Underopgave af</span>
                                            <button
                                                type="button"
                                                onClick={handleOpenParentTask}
                                                className="link cursor-pointer"
                                                style={{ color: colors.textPrimary }}
                                            >
                                                #{task.parent_task_id.slice(0, 8)}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pickers */}
            <DetailsSinglePicker
                key={`project-${openPicker?.key === "project" ? "open" : "closed"}-${task.project_id}`}
                open={openPicker?.key === "project"}
                triggerEl={openPicker?.key === "project" ? openPicker.triggerEl : null}
                onClose={closePicker}
                title="Vælg projekt"
                options={projects.map((project) => ({
                    value: project.project_id,
                    label: project.name,
                }))}
                selectedValue={task.project_id}
                onSelect={handleProjectSelect}
                searchable
                searchPlaceholder="Filtrer projekter"
            />
            <DetailsSinglePicker
                key={`priority-${openPicker?.key === "priority" ? "open" : "closed"}-${task.priority ?? "empty"}`}
                open={openPicker?.key === "priority"}
                triggerEl={openPicker?.key === "priority" ? openPicker.triggerEl : null}
                onClose={closePicker}
                title="Vælg prioritet"
                options={PRIORITY_OPTIONS}
                selectedValue={task.priority ?? undefined}
                onSelect={handlePrioritySelect}
                searchable
                searchPlaceholder="Filtrer prioritet"
            />
            <DetailsSinglePicker
                key={`status-${openPicker?.key === "status" ? "open" : "closed"}-${task.status}`}
                open={openPicker?.key === "status"}
                triggerEl={openPicker?.key === "status" ? openPicker.triggerEl : null}
                onClose={closePicker}
                title="Vælg status"
                options={STATUS_OPTIONS}
                selectedValue={task.status}
                onSelect={handleStatusSelect}
                searchable
                searchPlaceholder="Filtrer status"
            />
            <DetailsMultiPicker
                key={`assignee-${openPicker?.key === "assignee" ? "open" : "closed"}`}
                open={openPicker?.key === "assignee"}
                triggerEl={openPicker?.key === "assignee" ? openPicker.triggerEl : null}
                onClose={closePicker}
                title="Tildel medarbejdere"
                options={allUsers.map((u) => ({ value: u.user_id, label: u.name, subtitle: u.position }))}
                selectedValues={assignments.map((a) => a.user.user_id)}
                onSelect={handleAssigneesSelect}
                searchable
                searchPlaceholder="Filtrer medarbejdere"
            />

            <DetailsDatePicker
                key={`start-${openPicker?.key === "startDate" ? "open" : "closed"}-${task.start_date ?? "empty"}`}
                open={openPicker?.key === "startDate"}
                triggerEl={openPicker?.key === "startDate" ? openPicker.triggerEl : null}
                onClose={closePicker}
                value={task.start_date ?? null}
                onSelect={handleStartDateSelect}
            />
            <DetailsDatePicker
                key={`deadline-${openPicker?.key === "deadline" ? "open" : "closed"}-${task.deadline ?? "empty"}`}
                open={openPicker?.key === "deadline"}
                triggerEl={openPicker?.key === "deadline" ? openPicker.triggerEl : null}
                onClose={closePicker}
                value={task.deadline ?? null}
                onSelect={handleDeadlineSelect}
            />
            <DetailsGoalEditor
                open={openPicker?.key === "goal"}
                triggerEl={openPicker?.key === "goal" ? openPicker.triggerEl : null}
                onClose={closePicker}
                goalType={task.goal_type}
                unit={task.unit}
                targetQuantity={task.target_quantity}
                currentQuantity={task.current_quantity}
                onSave={handleGoalSave}
            />

            {/* Add Subtask Modal */}
            <Modal
                isOpen={showSubtaskModal}
                onClose={() => setShowSubtaskModal(false)}
                title="Tilføj underopgave"
                maxWidth="3xl"
            >
                <CreateTaskForm
                    onSuccess={() => setShowSubtaskModal(false)}
                    onCancel={() => setShowSubtaskModal(false)}
                    parentTaskId={task.task_id}
                    parentProjectId={task.project_id}
                />
            </Modal>

            <ConfirmModal
                isOpen={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleDeleteTask}
                title="Slet opgave"
                description="Er du sikker på, at du vil slette denne opgave?"
                confirmLabel="Slet"
                cancelLabel="Annuller"
                danger
                loading={deleteLoading}
            />
        </div>
    );
}
