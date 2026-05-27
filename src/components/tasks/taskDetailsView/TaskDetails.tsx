"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateTask, getTaskAssignments } from "@/lib/api";
import { TaskStatus, TaskPriority, TaskGoalType, TaskUnit } from "@/types/task";
import { formatDateTime, formatDate, translatePriority, translateStatus, getPriorityAccentColors, getStatusAccentColors, translateTaskUnit, formatNumber, downloadImages } from "@/helpers/helpers";


import Modal from "@/components/modal/Modal";
import CreateTaskForm from "@/components/tasks/createTask/CreateTaskForm";
import { Clock, Calendar, Ellipsis, Check, Trash2, X, Archive, Copy, ImageDown, CornerDownLeft } from "lucide-react";
import Badge from "../../common/label/Badge";
import ProjectBadge from "../../common/label/ProjectBadge";
import SingleAvatar from "../../common/label/SingleAvatar";
import RecurringBadge from "../../common/label/RecurringBadge";
import TaskTimeline from "@/components/tasks/taskDetailsView/taskTimeline/TaskTimeline";
import TaskDescriptionCard from "./TaskDescriptionCard";
import TextInput from "@/components/common/forms/TextInput";
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
import TaskDetailsLoadingState from "./TaskDetailsLoadingState";
import useDelayedVisibility from "@/hooks/useDelayedVisibility";
import { adminQueryKeys } from "@/lib/queries/admin";
import { fetchTaskDetailsData, taskQueryKeys, type TaskDetailsData } from "@/lib/queries/tasks";
import PageChrome from "@/components/layout/PageChrome";
import PageContainer from "@/components/layout/PageContainer";
import { useAuth } from "@/hooks/useAuth";
import Banner from "@/components/common/Banner";


interface TaskDetailsProps {
    taskId: string;
    onClose: () => void;
    onDelete?: (taskId: string) => void;
    fullPage?: boolean;
}

const sc = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

const COLLAPSE_THRESHOLD = 80;

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

export default function TaskDetails({ taskId, onClose, onDelete, fullPage = false }: TaskDetailsProps) {
    const [linkCopied, setLinkCopied] = useState(false);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const queryClient = useQueryClient();
    const router = useRouter();
    const { user: currentUser } = useAuth();

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        };
    }, []);

    const [scrollContainer, setScrollContainer] = useState<HTMLElement | Window | null>(null);

    const outerRef = useCallback((el: HTMLDivElement | null) => {
        if (!el) return;
        function findScrollParent(node: HTMLElement | null): HTMLElement | Window {
            if (!node || node === document.documentElement) return window;
            const { overflow, overflowY } = getComputedStyle(node);
            if (/auto|scroll/.test(overflow + overflowY)) return node;
            return findScrollParent(node.parentElement);
        }
        setScrollContainer(findScrollParent(el.parentElement));
    }, []);

    useEffect(() => {
        if (!scrollContainer) return;
        function handler() {
            const top = scrollContainer instanceof Window ? scrollContainer.scrollY : (scrollContainer as HTMLElement).scrollTop;
            setIsScrolled(top > COLLAPSE_THRESHOLD);
        }
        scrollContainer.addEventListener("scroll", handler, { passive: true });
        return () => scrollContainer.removeEventListener("scroll", handler);
    }, [scrollContainer]);

    const subtaskFormId = "create-subtask-form";
    const [showSubtaskModal, setShowSubtaskModal] = useState(false);
    const [subtaskCreateLoading, setSubtaskCreateLoading] = useState(false);
    const [subtaskSubmitLabel, setSubtaskSubmitLabel] = useState("Opret delopgave");
    const [isDownloading, setIsDownloading] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState("");
    const [titleSaveLoading, setTitleSaveLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { data, isLoading, error } = useQuery({
        queryKey: taskQueryKeys.details(taskId),
        queryFn: () => fetchTaskDetailsData(taskId),
    });
    const showDelayedLoader = useDelayedVisibility(isLoading, 180);

    const [openPicker, setOpenPicker] = useState<{ key: "project" | "priority" | "status" | "assignee" | "startDate" | "deadline" | "goal"; triggerEl: HTMLButtonElement } | null>(null);

    function handleCopyLink() {
        const url = `${window.location.origin}/tasks/${taskId}`;
        void navigator.clipboard.writeText(url)
            .then(() => {
                if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
                setLinkCopied(true);
                copyTimerRef.current = setTimeout(() => setLinkCopied(false), 2000);
            })
            .catch(() => toast.error("Kunne ikke kopiere link"));
    }
    const task = data?.task ?? null;
    const creator = task?.creator ?? null;
    const assignments = data?.assignments ?? [];
    const allUsers = data?.allUsers ?? [];
    const projects = data?.projects ?? [];

    function closePicker() {
        const pending = pendingAssigneesRef.current;
        pendingAssigneesRef.current = null;
        setOpenPicker(null);
        if (task && pending !== null) {
            void (async () => {
                try {
                    await updateTask(task.task_id, { assigned_users: pending });
                    const updated = await getTaskAssignments(task.task_id);
                    queryClient.setQueryData<TaskDetailsData>(taskQueryKeys.details(task.task_id), (current) => current ? { ...current, assignments: updated } : current);
                    queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasksPage });
                } catch {
                    toast.error("Kunne ikke opdatere tildelte brugere");
                }
            })();
        }
    }

    function togglePicker(key: "project" | "priority" | "status" | "assignee" | "startDate" | "deadline" | "goal", triggerEl: HTMLButtonElement) {
        if (isArchived) return;
        if (openPicker?.key === key) {
            closePicker();
        } else {
            closePicker();
            setOpenPicker({ key, triggerEl });
        }
    }

    async function handleDownloadAllImages() {
        if (!task || isDownloading) return;
        setIsDownloading(true);
        try {
            const attachments = await getTaskAttachments(task.task_id);
            const images = attachments.filter((a) => a.type === "IMAGE");
            if (images.length === 0) { toast.info("Ingen billeder at downloade"); return; }
            await downloadImages(images);
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
            queryClient.setQueryData<TaskDetailsData>(taskQueryKeys.details(task.task_id), (current) => current ? { ...current, task: updated } : current);
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasksPage });
        } catch {
            toast.error("Kunne ikke opdatere prioritet");
        }
    }

    async function handleProjectSelect(value: string) {
        if (!task || !value || value === task.project_id) return;
        try {
            const updated = await updateTask(task.task_id, { project_id: value });
            const selectedProject = projects.find((project) => project.project_id === value);
            queryClient.setQueryData<TaskDetailsData>(taskQueryKeys.details(task.task_id), (current) => {
                if (!current) return current;
                return {
                    ...current,
                    task: {
                        ...updated,
                        project: selectedProject
                            ? { name: selectedProject.name, color: selectedProject.color ?? null }
                            : updated.project,
                    },
                };
            });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasksPage });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.projectsPage });
        } catch {
            toast.error("Kunne ikke opdatere projekt");
        }
    }

    async function handleStatusSelect(value: string) {
        if (!task) return;
        try {
            const updated = await updateTask(task.task_id, { status: value as TaskStatus });
            queryClient.setQueryData<TaskDetailsData>(taskQueryKeys.details(task.task_id), (current) => current ? { ...current, task: updated } : current);
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasksPage });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.statsPage });
        } catch {
            toast.error("Kunne ikke opdatere status");
        }
    }

    async function handleStartDateSelect(isoDate: string | null) {
        if (!task) return;
        try {
            if (!isoDate) return;
            const updated = await updateTask(task.task_id, { start_date: isoDate + "T00:00:00.000Z" });
            queryClient.setQueryData<TaskDetailsData>(taskQueryKeys.details(task.task_id), (current) => current ? { ...current, task: updated } : current);
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasksPage });
        } catch {
            toast.error("Kunne ikke opdatere startdato");
        }
    }

    async function handleDeadlineSelect(isoDate: string | null) {
        if (!task) return;
        try {
            if (!isoDate) return;
            const updated = await updateTask(task.task_id, { deadline: isoDate + "T00:00:00.000Z" });
            queryClient.setQueryData<TaskDetailsData>(taskQueryKeys.details(task.task_id), (current) => current ? { ...current, task: updated } : current);
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasksPage });
        } catch {
            toast.error("Kunne ikke opdatere deadline");
        }
    }

    const pendingAssigneesRef = useRef<string[] | null>(null);

    function handleAssigneesSelect(userIds: string[]) {
        pendingAssigneesRef.current = userIds;
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
            queryClient.setQueryData<TaskDetailsData>(taskQueryKeys.details(task.task_id), (current) => current ? { ...current, task: updated } : current);
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasksPage });
        } catch {
            toast.error("Kunne ikke opdatere mål");
            throw new Error("goal-update-failed");
        }
    }

    async function handleDescriptionSave(description: string) {
        if (!task) return;
        try {
            const updated = await updateTask(task.task_id, { description });
            queryClient.setQueryData<TaskDetailsData>(taskQueryKeys.details(task.task_id), (current) => current ? { ...current, task: updated } : current);
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasksPage });
        } catch {
            toast.error("Kunne ikke opdatere beskrivelse");
            throw new Error("description-update-failed");
        }
    }

    function handleStartEditTitle() {
        if (!task) return;
        setTitleDraft(task.title);
        setIsEditingTitle(true);
    }

    function handleCancelEditTitle() {
        setIsEditingTitle(false);
        setTitleDraft("");
    }

    async function handleSaveTitle() {
        if (!task || titleSaveLoading) return;
        if (!titleDraft.trim()) { toast.error("Titel må ikke være tom"); return; }
        if (titleDraft.trim() === task.title) { setIsEditingTitle(false); return; }
        setTitleSaveLoading(true);
        try {
            const updated = await updateTask(task.task_id, { title: titleDraft.trim() });
            queryClient.setQueryData<TaskDetailsData>(taskQueryKeys.details(task.task_id), (current) => current ? { ...current, task: updated } : current);
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasksPage });
            setIsEditingTitle(false);
        } catch {
            toast.error("Kunne ikke opdatere titel");
        } finally {
            setTitleSaveLoading(false);
        }
    }

    function handleOpenParentTask() {
        if (!task?.parent_task_id) return;
        router.push(`/tasks/${task.parent_task_id}`);
    }

    async function handleDeleteTask() {
        if (!task) return;
        setDeleteLoading(true);
        try {
            const { deleteTask } = await import("@/lib/api");
            await deleteTask(task.task_id);
            queryClient.removeQueries({ queryKey: taskQueryKeys.details(task.task_id) });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasksPage });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.projectsPage });
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.statsPage });
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
        if (!showDelayedLoader) return null;
        return fullPage ? (
            <PageContainer size="task">
                <TaskDetailsLoadingState />
            </PageContainer>
        ) : <TaskDetailsLoadingState />;
    }

    if (error || !task) {
        const errorState = (
            <div className="h-full flex flex-col">
                <div className="p-6 bg-danger-surface border-b border-danger">
                    <span className="label-lg text-danger">{error instanceof Error ? error.message : error || "Opgave ikke fundet"}</span>
                </div>
            </div>
        );
        return fullPage ? <PageContainer size="task">{errorState}</PageContainer> : errorState;
    }

    const isArchived = task.status === TaskStatus.ARCHIVED;

    return (
        <div ref={outerRef} className={`flex flex-col bg-background ${fullPage ? "w-full min-w-0" : "min-h-full"}`}>
            {/* Archived banner */}
            {isArchived && (
                <div
                    className="flex items-center gap-2 px-4 py-2"
                    style={{ backgroundColor: colors.muted, borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}
                >
                    <Archive className="w-4 h-4" />
                    <span className="label-sm">Denne opgave er arkiveret og kan ikke redigeres</span>
                </div>
            )}

            <PageChrome
                header={isScrolled ? (
                    <div className="sticky top-0 z-20 w-full border-b border-border bg-background">
                        <PageContainer
                            size="task"
                            disabled={!fullPage}
                            className="flex items-center justify-between gap-4 px-8 py-3"
                        >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Badge variant="status" size="lg" value={task.status} />
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1 min-w-0">
                                    <span className="h5 truncate">{task.title}</span>
                                    {task.number > 0 && (
                                        fullPage
                                            ? <span className="font-normal shrink-0" style={{ color: colors.textMuted }}>#{task.number}</span>
                                            : <Link href={`/tasks/${taskId}`} className="font-normal shrink-0 hover:no-underline underline" style={{ color: colors.textMuted }}>#{task.number}</Link>
                                    )}
                                </div>
                                {(task.recurring_template_id || task.project?.name) && (
                                    <div className="flex items-center gap-2">
                                        {task.recurring_template_id && <RecurringBadge iconOnly size="sm" />}
                                        {task.project?.name && <ProjectBadge size="sm" name={task.project.name} />}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="md" icon={linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} iconOnly onClick={handleCopyLink} tooltip={linkCopied ? "Kopieret!" : "Kopier link"} />
                            <DropdownMenu
                                trigger={<Button variant="ghost" size="md" icon={<Ellipsis className="w-4 h-4" />} iconOnly tooltip="Mere" />}
                                items={[
                                    { label: isDownloading ? "Henter billeder..." : "Download billeder", icon: <ImageDown className="w-4 h-4" />, onClick: handleDownloadAllImages },
                                    { label: "Slet", icon: <Trash2 className="w-4 h-4" />, onClick: () => setConfirmDeleteOpen(true), danger: true, dividerBefore: true },
                                ]}
                            />
                            {!fullPage && <Button variant="ghost" size="md" icon={<X className="w-4 h-4" />} iconOnly onClick={onClose} aria-label="Luk" tooltip="Luk" />}
                        </div>
                        </PageContainer>
                    </div>
                ) : undefined}
            >

                <PageContainer size="task" disabled={!fullPage}>
                {/* Header */}
                <div className="px-8 pt-7 pb-5">
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2 mb-3">
                            <TextInput
                                autoFocus
                                value={titleDraft}
                                onChange={(e) => setTitleDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") void handleSaveTitle();
                                    if (e.key === "Escape") handleCancelEditTitle();
                                }}
                            />
                            <Button variant="secondary" size="md" onClick={handleCancelEditTitle} disabled={titleSaveLoading}>Annuller</Button>
                            <Button variant="primary" size="md" kbd={<CornerDownLeft className="w-3.5 h-3.5" />} onClick={() => void handleSaveTitle()} loading={titleSaveLoading}>Gem</Button>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between mb-3">
                            <h1 className="h1 wrap-break-word">
                                {task.title}
                                {task.number > 0 && (
                                    fullPage
                                        ? <span className="ml-2 font-normal" style={{ color: colors.textMuted }}>#{task.number}</span>
                                        : <Link href={`/tasks/${taskId}`} className="ml-2 font-normal hover:no-underline underline" style={{ color: colors.textMuted }}>#{task.number}</Link>
                                )}
                            </h1>
                            <div className="flex items-center gap-1 shrink-0">
                                {!isArchived && <Button variant="secondary" onClick={handleStartEditTitle}>Rediger</Button>}
                                <Button
                                    variant="ghost"
                                    size="md"
                                    icon={linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    iconOnly
                                    onClick={handleCopyLink}
                                    tooltip={linkCopied ? "Kopieret!" : "Kopier link"}
                                />
                                <DropdownMenu
                                    trigger={<Button variant="ghost" size="md" icon={<Ellipsis className="w-4 h-4" />} iconOnly tooltip="Mere" />}
                                    items={[
                                        { label: isDownloading ? "Henter billeder..." : "Download billeder", icon: <ImageDown className="w-4 h-4" />, onClick: handleDownloadAllImages },
                                        { label: "Slet", icon: <Trash2 className="w-4 h-4" />, onClick: () => setConfirmDeleteOpen(true), danger: true, dividerBefore: true },
                                    ]}
                                />
                                {!fullPage && <Button variant="ghost" size="md" icon={<X className="w-4 h-4" />} iconOnly onClick={onClose} aria-label="Luk" tooltip="Luk" />}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="status" value={task.status} size="lg" />
                        {task.recurring_template_id && <RecurringBadge size="lg" />}
                        {task.project?.name && <ProjectBadge name={task.project.name} size="md" />}
                    </div>
                </div>
                <div className="mx-8" style={{ borderTop: `1px solid ${colors.border}` }} />

                <div className="flex flex-1 px-8 gap-8 min-w-0">
                    {/* Main content */}
                    <div className="flex-1 pt-6 min-w-0">
                        <div className="mb-6 space-y-3">
                            <Banner variant="default" title="Standard banner">
                                Bruges til neutral information eller statusbeskeder.
                            </Banner>
                            <Banner variant="info" title="Info banner">
                                Bruges til nyttig kontekst, tips eller forklaringer.
                            </Banner>
                            <Banner variant="success" title="Success banner">
                                Bruges når en handling er gennemført.
                            </Banner>
                            <Banner variant="warning" title="Advarsel banner">
                                Bruges når brugeren bør være opmærksom før næste handling.
                            </Banner>
                            <Banner variant="danger" title="Fejl banner">
                                Bruges til fejl eller blokkerende problemer.
                            </Banner>
                        </div>
                        <TaskDescriptionCard
                            creator={creator}
                            creatorId={task.created_by}
                            createdAt={task.created_at}
                            description={task.description}
                            showSubtaskButton={task.parent_task_id == null}
                            onAddSubtask={() => setShowSubtaskModal(true)}
                            isArchived={isArchived}
                            isAuthor={currentUser?.user_id === task.created_by}
                            onSaveDescription={handleDescriptionSave}
                        />
                        <TaskTimeline taskId={task.task_id} creatorId={task.created_by} assigneeIds={assignments.map((a) => a.user_id)} isArchived={isArchived} />
                        <div className="h-12" />
                    </div>

                    {/* Sidebar */}
                    <div className="w-70 py-6 self-start" style={{ position: "sticky", top: isScrolled ? 64 : 16, transition: "top 150ms ease" }}>
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
                                                        {a.user.position?.name && <span className="body-xs block">{a.user.position.name}</span>}
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
                                            <Calendar className="w-4 h-4" style={{ color: colors.textMuted }} />
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
                                            <Clock className="w-4 h-4" style={{ color: colors.textMuted }} />
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
                                    {(() => {
                                        const targetQuantity = task.target_quantity;
                                        if (task.goal_type !== "FIXED" || targetQuantity == null || targetQuantity <= 0) {
                                            return undefined;
                                        }

                                        const currentQuantity = task.current_quantity ?? 0;
                                        const progressPercent = Math.max(0, Math.min(100, (currentQuantity / targetQuantity) * 100));

                                        return (
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="body-xs">Fremskridt</span>
                                                    <span className="label-md">
                                                        {formatNumber(currentQuantity)} / {formatNumber(targetQuantity)}
                                                        {task.unit ? ` ${translateTaskUnit(task.unit)}` : ""}
                                                    </span>
                                                </div>
                                                <div className="w-full rounded-full h-1.5" style={{ backgroundColor: colors.border }}>
                                                    <div
                                                        className="h-1.5 rounded-full transition-all"
                                                        style={{
                                                            width: `${progressPercent}%`,
                                                            backgroundColor: colors.green,
                                                        }}
                                                    />
                                                </div>
                                                <span className="caption" style={{ display: "block", textAlign: "right" }}>
                                                    {Math.round(progressPercent)}% fuldført
                                                </span>
                                            </div>
                                        );
                                    })()}
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
                </PageContainer>
            </PageChrome>

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
                options={allUsers.map((u) => ({ value: u.user_id, label: u.name, subtitle: u.position?.name }))}
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
                footer={
                    <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                        <Button
                            type="submit"
                            form={subtaskFormId}
                            loading={subtaskCreateLoading}
                            variant="primary"
                            size="md"
                        >
                            {subtaskSubmitLabel}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setShowSubtaskModal(false)}
                            disabled={subtaskCreateLoading}
                            variant="secondary"
                            size="md"
                        >
                            Annuller
                        </Button>
                    </div>
                }
            >
                <CreateTaskForm
                    formId={subtaskFormId}
                    onLoadingChange={setSubtaskCreateLoading}
                    onSubmitLabelChange={setSubtaskSubmitLabel}
                    onSuccess={() => setShowSubtaskModal(false)}
                    onComplete={() => setShowSubtaskModal(false)}
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
