"use client";

import { useEffect, useState } from "react";
import { Task, TaskStatus } from "@/types/task";
import { addTaskProgress, getTask, updateTask, getUser } from "@/lib/api";
import { User } from "@/types/users";
import { formatRelativeDate, translatePriority, translateTaskUnit } from "@/helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import UserTaskComment from "./UserTaskComment";

interface UserTaskDetailsProps {
    taskId: string;
    onBack: () => void;
}

export default function UserTaskDetails({ taskId, onBack }: UserTaskDetailsProps) {
    const [task, setTask] = useState<Task | null>(null);
    const [creator, setCreator] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [progressDelta, setProgressDelta] = useState("");
    const [progressNote, setProgressNote] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setIsLoading(true);
                const taskData = await getTask(taskId);
                setTask(taskData);

                // Fetch creator info
                if (taskData.created_by) {
                    try {
                        const creatorData = await getUser(taskData.created_by);
                        setCreator(creatorData);
                    } catch (err) {
                        console.error("Error fetching creator:", err);
                    }
                }
            } catch (err) {
                console.error("Error fetching task:", err);
                setError("Kunne ikke hente opgave detaljer");
            } finally {
                setIsLoading(false);
            }
        };

        if (taskId) {
            fetchTask();
        }
    }, [taskId]);


    const handleCompleteTask = async () => {
        if (!task) return;

        try {
            setIsUpdating(true);
            const newStatus = task.status === TaskStatus.DONE ? TaskStatus.PENDING : TaskStatus.DONE;
            const updatedTask = await updateTask(task.task_id, { status: newStatus });
            setTask(updatedTask);
        } catch (err) {
            console.error("Error updating task:", err);
            alert("Kunne ikke opdatere opgave");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAddProgress = async () => {
        if (!task) return;
        const delta = Number(progressDelta);

        if (!Number.isFinite(delta) || delta <= 0) {
            alert("Indtast et gyldigt fremskridt over 0");
            return;
        }

        try {
            setIsUpdating(true);
            await addTaskProgress(task.task_id, {
                quantity_done: delta,
                note: progressNote.trim() || undefined,
                unit: task.unit || undefined,
            });
            const updatedTask = await getTask(task.task_id);
            setTask(updatedTask);
            setProgressDelta("");
            setProgressNote("");
        } catch (err) {
            console.error("Error adding progress:", err);
            alert("Kunne ikke registrere fremskridt");
        } finally {
            setIsUpdating(false);
        }
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-green-500" />
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                        {error || "Opgave ikke fundet"}
                    </div>
                    <button
                        onClick={onBack}
                        className="mt-4 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Tilbage
                    </button>
                </div>
            </div>
        );
    }

    const getLeftBorderColor = () => {
        switch (task.priority) {
            case 'HIGH':
                return '#ef4444';
            case 'MEDIUM':
                return '#fb923c';
            case 'LOW':
                return '#facc15';
            default:
                return '#d1d5db';
        }
    };

    const getPriorityTextClass = () => {
        switch (task.priority) {
            case 'HIGH':
                return 'text-red-600';
            case 'MEDIUM':
                return 'text-orange-600';
            case 'LOW':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    const unitLabel = translateTaskUnit(task.unit);
    const currentQuantity = task.current_quantity ?? 0;
    const hasTarget = task.target_quantity != null;
    const progressPct = hasTarget && task.target_quantity
        ? Math.min(100, Math.round((currentQuantity / task.target_quantity) * 100))
        : null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 flex flex-col flex-1">
                {/* Header with close button */}
                <div className="flex items-center mb-4 sm:mb-6">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:scale-105 transition-all shrink-0"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-gray-600" />
                    </button>
                </div>

                {/* Main Card */}
                <div
                    className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col flex-1"
                    style={{
                        borderLeft: `4px solid ${getLeftBorderColor()}`
                    }}
                >
                    {/* Priority and Time Header */}
                    <div className="flex items-center justify-between mb-4 sm:mb-5 pb-4 border-b border-gray-200">
                        <div className={`text-xs font-semibold uppercase tracking-wide ${getPriorityTextClass()}`}>
                            {translatePriority(task.priority)} prioritet
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
                            {formatRelativeDate(task.deadline)}
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
                        {task.title}
                    </h1>

                    {/* Description */}
                    {task.description && (
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                            {task.description}
                        </p>
                    )}

                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900 mb-3">Fremskridt</h2>
                        <div className="text-sm text-gray-700 mb-2">
                            {hasTarget
                                ? `${currentQuantity}/${task.target_quantity}${unitLabel ? ` ${unitLabel}` : ""}`
                                : `${currentQuantity}${unitLabel ? ` ${unitLabel}` : ""}`}
                        </div>
                        {progressPct != null && (
                            <div className="w-full h-2 rounded bg-gray-200 overflow-hidden mb-3">
                                <div
                                    className="h-2 bg-teal-500 transition-all"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                                type="number"
                                min={0}
                                step="any"
                                placeholder={`+ ${unitLabel || "mængde"}`}
                                value={progressDelta}
                                onChange={(e) => setProgressDelta(e.target.value)}
                                className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Note (valgfri)"
                                value={progressNote}
                                onChange={(e) => setProgressNote(e.target.value)}
                                className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none sm:col-span-2"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddProgress}
                            disabled={isUpdating}
                            className="mt-3 inline-flex items-center rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                            Registrer fremskridt
                        </button>
                    </div>

                    {/* Comments Section */}
                    {/* Add Comment Input */}
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <UserTaskComment taskId={taskId} />
                    </div>

                    {/* Metadata Section */}
                    <div className="text-xs text-gray-500 space-y-1 mb-6 pb-6 border-b border-gray-100">
                        <div>
                            <span className="font-medium">Oprettet af:</span> {creator?.name || creator?.email || task.created_by}
                        </div>
                        <div>
                            <span className="font-medium">Oprettet:</span>{" "}
                            {new Date(task.created_at).toLocaleDateString('da-DK', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleCompleteTask}
                        disabled={isUpdating}
                        className={`w-full py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all mt-auto ${task.status === 'DONE'
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUpdating ? (
                            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                        ) : null}
                        {task.status === 'DONE' ? 'Marker som ikke færdig' : 'Færdig'}
                    </button>
                </div>
            </div>
        </div>
    );
}
