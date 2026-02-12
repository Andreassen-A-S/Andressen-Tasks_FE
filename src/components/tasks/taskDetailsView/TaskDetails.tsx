"use client";

import { useEffect, useState } from "react";
import { getTask, getUser } from "@/lib/api";
import type { Task } from "@/types/task";
import type { User } from "@/types/users";
import { formatDaDateTime, formatDaDate } from "@/helpers/helpers";

import { getTaskAssignments } from "@/lib/api";
import type { TaskAssignment } from "@/types/assignment";

import Modal from "@/components/modal/Modal";
import CreateTaskForm from "@/components/tasks/createTask/CreateTaskForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faCalendar,
    faFlag,
} from "@fortawesome/free-solid-svg-icons";
import Badge from "../../common/label/badge";
import SingleAvatar from "../../common/label/singleAvatar";
import { getTaskEvents } from "@/lib/api";
import type { TaskEvent } from "@/types/taskEvent";
import TaskTimeline from "@/components/tasks/taskDetailsView/taskTimeline/TaskTimeline";
import TaskDescriptionCard from "./TaskDescriptionCard";


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


    useEffect(() => {
        const fetchTask = async () => {
            try {
                setIsLoading(true);
                const taskData = await getTask(taskId);
                setTask(taskData);

                // Fetch assignments
                const assignmentData = await getTaskAssignments(taskId);
                setAssignments(assignmentData);


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
            <div className="px-8 pt-6 pb-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                        {/* title */}
                        <h1 className="text-4xl font-bold text-gray-900 wrap-break-word">
                            {task.title}
                        </h1>
                    </div>
                    {/* actions for task */}
                    <div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg px-3 py-2 transition-all"
                            aria-label="Luk"
                        >
                            <span className="text-xl">×</span>
                        </button>
                    </div>
                </div>

                {/* Status badge */}
                <div className="flex">
                    <Badge variant="status" value={task.status} />
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area with Timeline */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {/* Description Card - GitHub style */}
                    <TaskDescriptionCard
                        creator={creator}
                        createdAt={task.created_at}
                        description={task.description}
                        showSubtaskButton={task.parent_task_id == null}
                        onAddSubtask={() => setShowSubtaskModal(true)}
                    />

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

                <CreateTaskForm
                    onSuccess={() => setShowSubtaskModal(false)}
                    onCancel={() => setShowSubtaskModal(false)}
                    parentTaskId={task.task_id}
                />

            </Modal>
        </div>
    );
}