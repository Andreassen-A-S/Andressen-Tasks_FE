"use client";

import { useEffect, useState } from "react";
import { getTask, getUser } from "@/lib/api";
import type { Task } from "@/types/task";
import { TaskStatus } from "@/types/task";
import type { User } from "@/types/users";
import { formatDateTime, formatDate } from "@/helpers/helpers";

import { getTaskAssignments } from "@/lib/api";
import type { TaskAssignment } from "@/types/assignment";

import Modal from "@/components/modal/Modal";
import CreateTaskForm from "@/components/tasks/createTask/CreateTaskForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faCalendar,
    faFlag,
    faEllipsis,
    faImages,
    faXmark,
    faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";
import Badge from "../../common/label/badge";
import ProjectBadge from "../../common/label/ProjectBadge";
import SingleAvatar from "../../common/label/singleAvatar";
import TaskTimeline from "@/components/tasks/taskDetailsView/taskTimeline/TaskTimeline";
import TaskDescriptionCard from "./TaskDescriptionCard";

import Button from "@/components/common/buttons/Button";
import DropdownMenu from "@/components/common/DropdownMenu";
import { getTaskAttachments } from "@/lib/api";
import { toast } from "sonner";
import { colors } from "@/constants/colors";


interface TaskDetailsProps {
    taskId: string;
    onClose: () => void;
}

export default function TaskDetails({ taskId, onClose }: TaskDetailsProps) {
    const [task, setTask] = useState<Task | null>(null);
    const [creator, setCreator] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSubtaskModal, setShowSubtaskModal] = useState(false);
    const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);


    useEffect(() => {
        const fetchTask = async () => {
            try {
                setIsLoading(true);
                const taskData = await getTask(taskId);
                setTask(taskData);

                const assignmentData = await getTaskAssignments(taskId);
                setAssignments(assignmentData);

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
            if (images.length === 0) {
                toast.info("Ingen billeder at downloade");
                return;
            }
            for (const image of images) {
                const response = await fetch(image.url);
                if (!response.ok) {
                    toast.error(`Kunne ikke hente ${image.file_name ?? "billede"}`);
                    continue;
                }
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
                    <span className="label-lg text-red-800">
                        {error || "Opgave ikke fundet"}
                    </span>
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
                    style={{
                        backgroundColor: colors.muted,
                        borderBottom: `1px solid ${colors.border}`,
                        color: colors.textSecondary,
                    }}
                >
                    <FontAwesomeIcon icon={faBoxArchive} className="text-xs" />
                    <span className="label-sm">Denne opgave er arkiveret og kan ikke redigeres</span>
                </div>
            )}

            {/* Header */}
            <div className="px-8 pt-6 pb-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                    <h1 className="h2 wrap-break-word">
                        {task.title}
                    </h1>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <DropdownMenu
                            trigger={
                                <Button variant="ghost" size="md" icon={faEllipsis} iconOnly tooltip="Mere" />
                            }
                            items={[
                                {
                                    label: isDownloading ? "Henter billeder..." : "Download alle billeder",
                                    icon: faImages,
                                    onClick: handleDownloadAllImages,
                                },
                            ]}
                        />
                        <Button variant="ghost" size="md" icon={faXmark} iconOnly onClick={onClose} aria-label="Luk" tooltip="Luk" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="status" value={task.status} />
                    {task.project?.name && <ProjectBadge name={task.project.name} />}
                </div>
            </div>

            <div className="flex flex-1 overflow-y-auto">
                {/* Main Content Area */}
                <div className="flex-1 pl-8 pr-4 pt-6">
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
                <div
                    className="w-80 pl-4 pr-6 py-6 self-start"
                    style={{ position: "sticky", top: 0 }}
                >
                    <div className="space-y-6">
                        {/* Priority */}
                        <div>
                            <h3 className="overline mb-3">Prioritet</h3>
                            <Badge variant="priority" value={task.priority} />
                        </div>

                        <div className="border-t border-gray-200" />

                        {/* Assignees */}
                        <div>
                            <h3 className="overline mb-3">Tildelt til</h3>
                            <div>
                                {isLoading ? (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                                ) : assignments.length === 0 ? (
                                    <span className="body-xs">Ingen tildelt</span>
                                ) : (
                                    <ul className="space-y-2">
                                        {assignments.map((assignment) => (
                                            <li key={assignment.user.user_id} className="flex items-center gap-2">
                                                <SingleAvatar name={assignment.user.name} size="sm" />
                                                <span className="label-md">{assignment.user.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200" />

                        {/* Start Date */}
                        <div>
                            <h3 className="overline mb-3">Startdato</h3>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendar} className="text-gray-400 text-xs" />
                                <span className="body-sm">
                                    {task.start_date ? formatDate(task.start_date) : 'Ingen startdato'}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-gray-200" />

                        {/* Deadline */}
                        <div>
                            <h3 className="overline mb-3">Deadline</h3>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs" />
                                <span className="body-sm">
                                    {task.deadline ? formatDate(task.deadline) : 'Ingen deadline'}
                                </span>
                            </div>
                        </div>

                        {/* Goal */}
                        {task.goal_type === "FIXED" && task.target_quantity != null && (
                            <>
                                <div className="border-t border-gray-200" />
                                <div>
                                    <h3 className="overline mb-3">
                                        <FontAwesomeIcon icon={faFlag} className="mr-1" />
                                        Mål
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="body-xs">Fremskridt:</span>
                                            <span className="label-md">
                                                {task.current_quantity ?? 0} / {task.target_quantity}
                                                {task.unit ? ` ${task.unit.toLowerCase()}` : ''}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(100, ((task.current_quantity ?? 0) / task.target_quantity) * 100)}%`
                                                }}
                                            />
                                        </div>
                                        <div className="caption text-right">
                                            {Math.round(Math.min(100, ((task.current_quantity ?? 0) / task.target_quantity) * 100))}% fuldført
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="border-t border-gray-200" />

                        {/* Metadata */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="caption">Oprettet</span>
                                <span className="label-sm text-gray-900">{formatDateTime(task.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="caption">Sidst opdateret</span>
                                <span className="label-sm text-gray-900">{formatDateTime(task.updated_at)}</span>
                            </div>
                            {task.parent_task_id && (
                                <div className="flex justify-between">
                                    <span className="caption">Underopgave af</span>
                                    <span className="link cursor-pointer hover:underline">
                                        #{task.parent_task_id.slice(0, 8)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
        </div>
    );
}