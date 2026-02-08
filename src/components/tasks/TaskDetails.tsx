"use client";

import { useEffect, useState } from "react";
import { getTask, getUser } from "@/lib/api";
import type { Task } from "@/types/task";
import type { User } from "@/types/users";
import { formatRelativeDate } from "@/helpers/helpers";
import TaskComments from "@/components/tasks/TaskComment";
import Modal from "@/components/modal/Modal";
import CreateTaskForm from "@/components/tasks/CreateTaskForm";

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

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setIsLoading(true);
                const taskData = await getTask(taskId);
                setTask(taskData);

                if (taskData.created_by) {
                    try {
                        const creatorData = await getUser(taskData.created_by);
                        setCreator(creatorData);
                    } catch (err) {
                        console.error("Error fetching creator:", err);
                    }
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
        <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-[#fafbfc] flex justify-between items-start">
                <div className="flex-1 pr-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight tracking-tight">
                        {task.title}
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        #{task.task_id.slice(0, 8)} • Oprettet af {creator?.name || creator?.email || 'Ukendt'} • {formatRelativeDate(task.created_at)}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded px-2 py-1 transition-all text-2xl leading-none -mt-1"
                    aria-label="Luk"
                >
                    ×
                </button>
            </div>

            {/* Panel Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
                {/* Description Section */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-4 pb-2 border-b-2 border-gray-200">
                        Beskrivelse
                    </h3>
                    <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                        {task.description || <span className="italic text-gray-400">Ingen beskrivelse</span>}
                    </div>
                    <div className="flex flex-row gap-2">
                        {/* Only show if task is NOT a subtask */}
                        {task.parent_task_id == null && (
                            <button
                                onClick={() => setShowSubtaskModal(true)}
                                className="bg-indigo-600 text-white px-3 py-1 rounded font-medium text-sm hover:bg-indigo-500 transition"
                            >
                                Tilføj underopgave
                            </button>
                        )}
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mb-6 pb-6 border-b border-gray-100">
                    <TaskComments taskId={taskId} />
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