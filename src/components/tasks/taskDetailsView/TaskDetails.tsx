"use client";

import { useEffect, useState } from "react";
import { getTask, getUser } from "@/lib/api";
import type { Task } from "@/types/task";
import type { User } from "@/types/users";
import { formatRelativeDate, formatDaDateTime, formatDaDate } from "@/helpers/helpers";

import { getTaskAssignments } from "@/lib/api";
import type { TaskAssignment } from "@/types/assignment";

import Modal from "@/components/modal/Modal";
import CreateTaskForm from "@/components/tasks/CreateTaskForm";
import { TaskPriority, TaskStatus } from "@/types/task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircle,
    faCheckCircle,
    faXmarkCircle,
    faClock,
    faCalendar,
    faUser,
    faArrowUp,
    faArrowDown,
    faMinus,
    faFlag,
    faComment,
    faEdit,
    faUserPlus
} from "@fortawesome/free-solid-svg-icons";
import Badge from "../../label/badge";
import SingleAvatar from "../../label/singleAvatar";
import { getTaskEvents } from "@/lib/api";
import type { TaskEvent } from "@/types/taskEvent";
import TaskTimeline from "@/components/tasks/taskDetailsView/taskTimeline/TaskTimeline";


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
    const [taskEvents, setTaskEvents] = useState<TaskEvent[]>([]);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setIsLoading(true);
                const taskData = await getTask(taskId);
                setTask(taskData);

                // Fetch assignments
                const assignmentData = await getTaskAssignments(taskId);
                setAssignments(assignmentData);

                // Fetch task events
                const events = await getTaskEvents(taskId);
                setTaskEvents(events);

                if (taskData.created_by) {
                    const creatorData = await getUser(taskData.created_by);
                    setCreator(creatorData);
                }
            } catch (err) {
                setError("Kunne ikke hente opgave detaljer");
            } finally {
                setIsLoading(false);
            }
        };

        if (taskId) fetchTask();
    }, [taskId]);


    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.DONE:
                return <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />;
            case TaskStatus.REJECTED:
                return <FontAwesomeIcon icon={faXmarkCircle} className="text-red-600" />;
            case TaskStatus.PENDING:
                return <FontAwesomeIcon icon={faCircle} className="text-yellow-600" />;
            default:
                return <FontAwesomeIcon icon={faCircle} className="text-gray-400" />;
        }
    };

    const getStatusLabel = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.DONE:
                return "Færdig";
            case TaskStatus.REJECTED:
                return "Afvist";
            case TaskStatus.PENDING:
                return "Afventer";
            default:
                return status;
        }
    };

    const getPriorityIcon = (priority: TaskPriority) => {
        switch (priority) {
            case TaskPriority.HIGH:
                return <FontAwesomeIcon icon={faArrowUp} className="text-red-600" />;
            case TaskPriority.LOW:
                return <FontAwesomeIcon icon={faArrowDown} className="text-blue-600" />;
            case TaskPriority.MEDIUM:
                return <FontAwesomeIcon icon={faMinus} className="text-yellow-600" />;
            default:
                return <FontAwesomeIcon icon={faMinus} className="text-gray-400" />;
        }
    };

    const getPriorityLabel = (priority: TaskPriority) => {
        switch (priority) {
            case TaskPriority.HIGH:
                return "Høj";
            case TaskPriority.MEDIUM:
                return "Mellem";
            case TaskPriority.LOW:
                return "Lav";
            default:
                return priority;
        }
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-sm">Indlæser...</div>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-6 bg-red-50 border-b border-red-200">
                    <div className="text-red-800 font-medium">
                        {error || "Opgave ikke fundet"}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* GitHub-style Header */}
            <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                            {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">
                                {task.title}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-semibold">#{task.task_id.slice(0, 8)}</span>
                                <span>•</span>
                                <span>åbnet {formatRelativeDate(task.created_at)}</span>
                                <span>af {creator?.name || creator?.email || 'Ukendt'}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg px-3 py-2 transition-all"
                        aria-label="Luk"
                    >
                        <span className="text-xl">×</span>
                    </button>
                </div>

                {/* Status and Priority badges */}
                <div className="flex gap-2 ml-9">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${task.status === TaskStatus.DONE
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : task.status === TaskStatus.REJECTED
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                        {getStatusIcon(task.status)}
                        {getStatusLabel(task.status)}
                    </span>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${task.priority === TaskPriority.HIGH
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : task.priority === TaskPriority.LOW
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                        {getPriorityIcon(task.priority)}
                        Prioritet: {getPriorityLabel(task.priority)}
                    </span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area with Timeline */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {/* Description Card - GitHub style */}
                    <div className="mb-6">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Card Header */}
                            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                                <SingleAvatar
                                    name={creator?.name || creator?.email || "Ukendt"}
                                    size="sm"
                                />
                                <div className="flex-1">
                                    <div className="text-sm">
                                        <span className="font-semibold text-gray-900">
                                            {creator?.name || creator?.email || 'Ukendt'}
                                        </span>
                                        {' '}
                                        <span className="text-gray-600">kommenterede</span>
                                        {' '}
                                        <span className="text-gray-500">
                                            {formatRelativeDate(task.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 bg-white">
                                <div className="mb-4">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                        Beskrivelse
                                    </h3>
                                    {task.description ? (
                                        <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                                            {task.description}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 italic text-sm">
                                            Ingen beskrivelse tilgængelig
                                        </div>
                                    )}
                                </div>

                                {/* Subtask Action */}
                                {task.parent_task_id == null && (
                                    <button
                                        onClick={() => setShowSubtaskModal(true)}
                                        className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md font-medium text-sm transition-colors border border-gray-300"
                                    >
                                        + Tilføj underopgave
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <TaskTimeline taskId={task.task_id} />

                </div>

                {/* Sidebar - GitHub style */}
                <div className="w-80 border-l border-gray-200 overflow-y-auto px-6 py-6">
                    <div className="space-y-6">
                        {/* Priority */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                Prioritet
                            </h3>
                            <Badge variant="priority" value={task.priority} />
                        </div>

                        <div className="border-t border-gray-200"></div>

                        {/* Assignees */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                Tildelt til
                            </h3>
                            <div className="text-sm text-gray-600">
                                {isLoading ? (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                                ) : assignments.length === 0 ? (
                                    <span className="text-gray-400">Ingen tildelt</span>
                                ) : (
                                    <ul className="space-y-2">
                                        {assignments.map((assignment) => (
                                            <li key={assignment.user.user_id} className="flex items-center gap-2">
                                                <SingleAvatar name={assignment.user.name} size="sm" />
                                                <span className="text-gray-800">{assignment.user.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200"></div>

                        {/* Dates */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                Planlagt dato
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <FontAwesomeIcon icon={faCalendar} className="text-xs text-gray-500" />
                                <span>{task.scheduled_date ? formatDaDate(task.scheduled_date) : 'Ikke planlagt'}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-200"></div>

                        <div>
                            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                Deadline
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <FontAwesomeIcon icon={faClock} className="text-xs text-gray-500" />
                                <span>{task.deadline ? formatDaDate(task.deadline) : 'Ingen deadline'}</span>
                            </div>
                        </div>

                        {/* Goal Information */}
                        {task.goal_type === "FIXED" && task.target_quantity != null && (
                            <>
                                <div className="border-t border-gray-200"></div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                        <FontAwesomeIcon icon={faFlag} className="mr-1" />
                                        Mål
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Fremskridt:</span>
                                            <span className="font-semibold text-gray-900">
                                                {task.current_quantity ?? 0} / {task.target_quantity}
                                                {task.unit !== "NONE" && task.unit ? ` ${task.unit.toLowerCase()}` : ''}
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
                                        <div className="text-xs text-gray-500 text-right">
                                            {Math.round(Math.min(100, ((task.current_quantity ?? 0) / task.target_quantity) * 100))}% fuldført
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="border-t border-gray-200"></div>

                        {/* Metadata */}
                        <div>
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span>Oprettet</span>
                                    <span className="text-gray-900">{formatDaDateTime(task.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sidst opdateret</span>
                                    <span className="text-gray-900">{formatDaDateTime(task.updated_at)}</span>
                                </div>
                                {task.parent_task_id && (
                                    <div className="flex justify-between">
                                        <span>Underopgave af:</span>
                                        <span className="text-blue-600 hover:underline cursor-pointer">
                                            #{task.parent_task_id.slice(0, 8)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Subtask Modal */}
            <Modal
                isOpen={showSubtaskModal}
                onClose={() => setShowSubtaskModal(false)}
                title="Tilføj underopgave"
                maxWidth="lg"
            >
                {task && (
                    <CreateTaskForm
                        onSuccess={() => setShowSubtaskModal(false)}
                        onCancel={() => setShowSubtaskModal(false)}
                        parentTaskId={task.task_id}
                    />
                )}
            </Modal>
        </div>
    );
}