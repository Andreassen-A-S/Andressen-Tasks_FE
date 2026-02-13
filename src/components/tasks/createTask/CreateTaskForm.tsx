"use client";

import { useState } from "react";
import { createSubtask, createTask } from "@/lib/api";
import type { Task, CreateTaskInput, CreateSubtaskInput } from "@/types/task";
import { TaskGoalType, TaskPriority, TaskStatus, TaskUnit } from "@/types/task";
import { useAuth } from "@/hooks/useAuth";
import { FontAwesomeIcon, } from "@fortawesome/react-fontawesome";
import { toIsoEndOfDay } from "@/helpers/helpers";
import { faCircleInfo, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { RecurrenceFrequency } from "@/types/recuringTemplate";
import BasicInfoSection from "./BasicInfoCard";
import RecurringCard from "./RecurringCard";
import AssignmentCard from "./AssignmentCard";
import { createRecurringTemplate } from "@/lib/api";
import GoalSection from "./GoalCard";
import SchedulingCard from "./SchedulingCard";

interface CreateTaskFormProps {
    onSuccess: (task: Task) => void;
    onCancel: () => void;
    parentTaskId?: string;
}

export default function CreateTaskForm({ onSuccess, onCancel, parentTaskId }: CreateTaskFormProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState<CreateTaskInput>({
        parent_task_id: parentTaskId || undefined,
        title: "",
        description: "",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        deadline: new Date().toISOString().split("T")[0],
        created_by: user?.user_id || "",
        assigned_users: [],
        scheduled_date: new Date().toISOString().split("T")[0],
        unit: undefined,
        goal_type: TaskGoalType.OPEN,
        target_quantity: undefined,
        current_quantity: undefined,
    });

    // recurring-specific state
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringData, setRecurringData] = useState({
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 1,
        days_of_week: [] as number[],
        day_of_month: undefined as number | undefined,
        start_date: new Date().toISOString().split("T")[0],
        end_date: undefined as string | undefined,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSubtask = !!parentTaskId;

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
            let newTask;

            // Recurring templates (only for parent tasks)
            if (isRecurring && !isSubtask) {
                const templateData = {
                    title: formData.title,
                    description: formData.description || undefined,
                    priority: formData.priority,
                    unit: formData.unit || TaskUnit.NONE,
                    target_quantity: formData.target_quantity == null ? undefined : formData.target_quantity,
                    goal_type: formData.goal_type || TaskGoalType.OPEN,
                    frequency: recurringData.frequency,
                    interval: recurringData.interval,
                    days_of_week: recurringData.days_of_week.length > 0 ? recurringData.days_of_week : undefined,
                    day_of_month: recurringData.day_of_month,
                    start_date: toIsoEndOfDay(recurringData.start_date),
                    end_date: recurringData.end_date ? toIsoEndOfDay(recurringData.end_date) : undefined,
                    assigned_users: formData.assigned_users,
                };

                await createRecurringTemplate(templateData);
                onCancel();

                return;
            }

            // Regular task or subtask creation
            if (isSubtask && parentTaskId) {
                const subtaskData: CreateSubtaskInput = {
                    title: formData.title,
                    description: formData.description,
                    priority: formData.priority,
                    status: formData.status,
                    deadline: toIsoEndOfDay(formData.deadline),
                    created_by: formData.created_by,
                    assigned_users: formData.assigned_users,
                    scheduled_date: toIsoEndOfDay(formData.scheduled_date),
                    unit: formData.unit,
                    goal_type: formData.goal_type || TaskGoalType.OPEN,
                    target_quantity: formData.target_quantity == null ? undefined : formData.target_quantity,
                    current_quantity: formData.current_quantity,
                    parent_task_id: parentTaskId,
                };
                newTask = await createSubtask(subtaskData);
            } else {
                const taskData: CreateTaskInput = {
                    title: formData.title,
                    description: formData.description,
                    priority: formData.priority,
                    status: formData.status,
                    deadline: toIsoEndOfDay(formData.deadline),
                    created_by: formData.created_by,
                    assigned_users: formData.assigned_users,
                    scheduled_date: toIsoEndOfDay(formData.scheduled_date),
                    unit: formData.unit,
                    goal_type: formData.goal_type || TaskGoalType.OPEN,
                    target_quantity: formData.target_quantity == null ? undefined : formData.target_quantity,
                    current_quantity: formData.current_quantity,
                };
                newTask = await createTask(taskData);
            }

            onSuccess(newTask);
        } catch (error) {
            console.error("Failed to create task:", error);
            setError("Kunne ikke oprette opgave. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }


    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Info Banner for Subtasks */}
            {isSubtask && (
                <div className="mb-6 p-4 bg-cyan-50 border-l-4 border-cyan-500 rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <span className="text-cyan-600 text-lg">
                            <FontAwesomeIcon icon={faCircleInfo} />
                        </span>
                        <div>
                            <h4 className="text-sm font-semibold text-cyan-900">Opretter underopgave</h4>
                            <p className="text-sm text-cyan-700 mt-1">
                                Husk at angive brugertildelinger og enhed for denne underopgave nedenfor.
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
                        isRecurring={isRecurring}
                        onFieldChange={handleBasicInfoFieldChange}
                    />

                    {/* Assignment Section */}
                    <AssignmentCard
                        assignedUsers={formData.assigned_users}
                        onAssignedUsersChange={handleAssignedUsersChange}
                    />

                    {/* Advanced Options - Goal Section */}
                    {!isSubtask && (
                        <GoalSection
                            goalType={formData.goal_type}
                            targetQuantity={formData.target_quantity}
                            unit={formData.unit}
                            currentQuantity={formData.current_quantity}
                            onGoalTypeChange={handleGoalTypeChange}
                            onFieldChange={handleGoalFieldChange}
                        />
                    )}

                    {/* Recurring Card */}
                    {!isSubtask && (
                        <RecurringCard
                            isRecurring={isRecurring}
                            setIsRecurring={setIsRecurring}
                            recurringData={recurringData}
                            setRecurringData={setRecurringData}
                            isSubtask={isSubtask}
                        />
                    )}

                    {/* Scheduling (only for non-recurring tasks) */}
                    {!isRecurring && (
                        <SchedulingCard
                            scheduledDate={formData.scheduled_date}
                            onScheduledDateChange={handleScheduledDateChange}
                        />
                    )}
                </div>
            </div>

            {/* Fixed Footer with Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 bg-white">
                <div className="flex flex-col-reverse sm:flex-row-reverse gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all sm:w-auto"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Opretter...</span>
                            </>
                        ) : (
                            <span>
                                Opret {isRecurring ? 'Gentagende Opgave' : isSubtask ? 'Delopgave' : 'Opgave'}
                            </span>
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