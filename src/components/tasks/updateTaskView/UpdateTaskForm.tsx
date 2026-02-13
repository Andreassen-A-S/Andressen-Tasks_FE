"use client";

import { useState, useEffect } from "react";
import { updateTask, getTaskAssignments } from "@/lib/api";
import type { Task, UpdateTaskInput } from "@/types/task";
import { TaskGoalType, TaskPriority, TaskUnit } from "@/types/task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { removeUndefined, toIsoEndOfDay } from "@/helpers/helpers";
import BasicInfoSection from "../createTask/BasicInfoCard";
import AssignmentCard from "../createTask/AssignmentCard";
import GoalSection from "../createTask/GoalCard";
import SchedulingCard from "../createTask/SchedulingCard";
import { TaskStatus } from "@/types/task";

interface UpdateTaskFormProps {
    task: Task;
    onSuccess: (task: Task) => void;
    onCancel: () => void;
}

export default function UpdateTaskForm({ task, onSuccess, onCancel }: UpdateTaskFormProps) {
    const isSubtask = !!task.parent_task_id;
    const isRecurringInstance = !!task.recurring_template_id;

    const [formData, setFormData] = useState<UpdateTaskInput>({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        deadline: new Date(task.deadline).toISOString().split("T")[0],
        assigned_users: [],
        scheduled_date: new Date(task.scheduled_date).toISOString().split("T")[0],
        unit: task.unit,
        goal_type: task.goal_type || TaskGoalType.OPEN,
        target_quantity: task.target_quantity ?? undefined,
        current_quantity: task.current_quantity ?? 0,
    });

    const [loading, setLoading] = useState(false);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load current assignments
    useEffect(() => {
        async function loadAssignments() {
            try {
                const assignments = await getTaskAssignments(task.task_id);
                const assignedUserIds = assignments.map(a => a.user_id);
                setFormData(prev => ({ ...prev, assigned_users: assignedUserIds }));
            } catch (error) {
                console.error("Failed to load task assignments:", error);
                setError("Kunne ikke indlæse tildelte brugere");
            } finally {
                setLoadingAssignments(false);
            }
        }

        loadAssignments();
    }, [task.task_id]);

    // Centralized handler for goal type changes
    const handleGoalTypeChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            goal_type: checked ? TaskGoalType.FIXED : TaskGoalType.OPEN,
            // Reset values when unchecking
            target_quantity: checked ? prev.target_quantity : undefined,
            unit: checked ? prev.unit : undefined,
            current_quantity: checked ? prev.current_quantity : undefined,
        }));
    };

    // Centralized handler for goal field changes
    const handleGoalFieldChange = (field: string, value: number | TaskUnit | undefined) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Centralized handler for basic info field changes
    const handleBasicInfoFieldChange = (field: string, value: string | TaskPriority | TaskStatus | undefined) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Centralized handler for assigned users
    const handleAssignedUsersChange = (userIds: string[]) => {
        setFormData(prev => ({ ...prev, assigned_users: userIds }));
    };

    // Centralized handler for scheduled date
    const handleScheduledDateChange = (date: string) => {
        setFormData(prev => ({ ...prev, scheduled_date: date }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Convert date to ISO-8601 DateTime
            const taskData = removeUndefined({
                ...formData,
                deadline: toIsoEndOfDay(formData.deadline ?? ""),
                scheduled_date: formData.scheduled_date ? toIsoEndOfDay(formData.scheduled_date) : undefined,
            });
            const updatedTask = await updateTask(task.task_id, taskData);
            onSuccess(updatedTask);
        } catch (error) {
            console.error("Failed to update task:", error);
            setError("Kunne ikke opdatere opgaven. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    if (loadingAssignments) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="text-sm text-gray-500">Indlæser opgave data...</div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Info Banner for Recurring Tasks */}
            {isRecurringInstance && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <span className="text-blue-600 text-lg">
                            <FontAwesomeIcon icon={faCircleInfo} />
                        </span>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-900">Gentagende opgave instans</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Dette er en instans af en gentagende opgave. Ændringer påvirker kun denne specifikke instans.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Banner for Subtasks */}
            {isSubtask && (
                <div className="mb-6 p-4 bg-cyan-50 border-l-4 border-cyan-500 rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <span className="text-cyan-600 text-lg">
                            <FontAwesomeIcon icon={faCircleInfo} />
                        </span>
                        <div>
                            <h4 className="text-sm font-semibold text-cyan-900">Redigerer underopgave</h4>
                            <p className="text-sm text-cyan-700 mt-1">
                                Denne opgave er en underopgave af en større opgave.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <span className="text-red-600 text-lg">
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                        </span>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-6">
                    {/* Basic Info Section */}
                    <BasicInfoSection
                        title={formData.title}
                        description={formData.description}
                        priority={formData.priority}
                        deadline={formData.deadline}
                        isSubtask={isSubtask}
                        isRecurring={false}
                        onFieldChange={handleBasicInfoFieldChange}
                        showStatus={true}
                        status={formData.status}
                    />

                    {/* Assignment Section */}
                    <AssignmentCard
                        assignedUsers={formData.assigned_users}
                        onAssignedUsersChange={handleAssignedUsersChange}
                    />

                    {/* Advanced Options - Goal Section (Parent tasks only) */}
                    {!isSubtask && (
                        <GoalSection
                            goalType={formData.goal_type}
                            targetQuantity={formData.target_quantity ?? undefined}
                            unit={formData.unit}
                            currentQuantity={formData.current_quantity ?? undefined}
                            onGoalTypeChange={handleGoalTypeChange}
                            onFieldChange={handleGoalFieldChange}
                        />
                    )}

                    {/* Scheduling */}
                    <SchedulingCard
                        scheduledDate={formData.scheduled_date}
                        onScheduledDateChange={handleScheduledDateChange}
                    />
                </div>
            </div>

            {/* Fixed Footer with Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 bg-white">
                <div className="flex flex-col-reverse sm:flex-row-reverse gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white  hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all sm:w-auto"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Opdaterer...</span>
                            </>
                        ) : (
                            <span>Opdater Opgave</span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="inline-flex w-full justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all sm:w-auto"
                    >
                        Annuller
                    </button>
                </div>
            </div>
        </form>
    );
}