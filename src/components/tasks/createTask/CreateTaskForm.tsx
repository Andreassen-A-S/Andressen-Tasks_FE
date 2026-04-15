"use client";

import { useState } from "react";
import { createSubtask, createTask } from "@/lib/api";
import type { Task, CreateTaskInput } from "@/types/task";
import { TaskGoalType, TaskPriority, TaskStatus, TaskUnit } from "@/types/task";
import { useAuth } from "@/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toIsoDate, toDateKey } from "@/helpers/helpers";
import { faCircleInfo, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { RecurrenceFrequency } from "@/types/recuringTemplate";
import BasicInfoSection from "./BasicInfoCard";
import RecurringCard from "./RecurringCard";
import AssignmentCard, { type CreationMode } from "./AssignmentCard";
import { createRecurringTemplate } from "@/lib/api";
import GoalSection from "./GoalCard";
import SchedulingCard from "./SchedulingCard";
import ProjectPickerCard from "./ProjectPickerCard";
import { toast } from "sonner";

interface CreateTaskFormProps {
    onSuccess: (task: Task) => void;
    onCancel: () => void;
    parentTaskId?: string;
    parentProjectId?: string;
}

export default function CreateTaskForm({ onSuccess, onCancel, parentTaskId, parentProjectId }: CreateTaskFormProps) {
    const { user } = useAuth();
    const [projectId, setProjectId] = useState(parentProjectId ?? "");
    const [formData, setFormData] = useState<Omit<CreateTaskInput, "project_id">>({
        parent_task_id: parentTaskId || undefined,
        title: "",
        description: "",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        deadline: toDateKey(new Date()),
        created_by: user?.user_id || "",
        assigned_users: [],
        start_date: toDateKey(new Date()),
        unit: undefined,
        goal_type: TaskGoalType.OPEN,
        target_quantity: undefined,
        current_quantity: undefined,
    });

    const [creationMode, setCreationMode] = useState<CreationMode>("combined");
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringData, setRecurringData] = useState({
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 1,
        days_of_week: [] as number[],
        day_of_month: undefined as number | undefined,
        start_date: toDateKey(new Date()),
        end_date: undefined as string | undefined,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSubtask = !!parentTaskId;

    const handleGoalTypeChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            goal_type: checked ? TaskGoalType.FIXED : TaskGoalType.OPEN,
            target_quantity: checked ? prev.target_quantity : undefined,
            unit: checked ? prev.unit : undefined,
            current_quantity: checked ? prev.current_quantity : undefined,
        }));
    };

    const handleGoalFieldChange = (field: string, value: number | TaskUnit | undefined) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleBasicInfoFieldChange = (field: string, value: string | TaskPriority | TaskStatus | undefined) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAssignedUsersChange = (userIds: string[]) => {
        setFormData(prev => ({ ...prev, assigned_users: userIds }));
    };

    const handleStartDateChange = (date: string) => {
        setFormData(prev => ({ ...prev, start_date: date }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!projectId) {
            setError("Vælg venligst et projekt.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let newTask;

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
                    start_date: toIsoDate(recurringData.start_date),
                    end_date: recurringData.end_date ? toIsoDate(recurringData.end_date) : undefined,
                    assigned_users: formData.assigned_users,
                    project_id: projectId,
                };

                await createRecurringTemplate(templateData);
                onCancel();
                return;
            }

            const sharedFields = {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                status: formData.status,
                deadline: toIsoDate(formData.deadline),
                created_by: formData.created_by,
                project_id: projectId,
                start_date: toIsoDate(formData.start_date || toDateKey(new Date())),
                unit: formData.unit,
                goal_type: formData.goal_type || TaskGoalType.OPEN,
                target_quantity: formData.target_quantity == null ? undefined : formData.target_quantity,
                current_quantity: formData.current_quantity,
            };

            const shouldCreateIndividual =
                creationMode === "individual" && formData.assigned_users.length >= 2;

            if (shouldCreateIndividual) {
                const createFn = isSubtask && parentTaskId
                    ? (users: string[]) => createSubtask({ ...sharedFields, assigned_users: users, parent_task_id: parentTaskId })
                    : (users: string[]) => createTask({ ...sharedFields, assigned_users: users });

                const results = await Promise.all(
                    formData.assigned_users.map((userId) => createFn([userId]))
                );
                newTask = results[results.length - 1];
            } else {
                if (isSubtask && parentTaskId) {
                    newTask = await createSubtask({
                        ...sharedFields,
                        assigned_users: formData.assigned_users,
                        parent_task_id: parentTaskId,
                    });
                } else {
                    newTask = await createTask({
                        ...sharedFields,
                        assigned_users: formData.assigned_users,
                    });
                }
            }

            toast.success("Opgave oprettet");
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
                <div className="mb-6 p-4 bg-[#EBF0FD] border-l-4 border-[#2C5FE0] rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <span className="text-[#2C5FE0] text-lg">
                            <FontAwesomeIcon icon={faCircleInfo} />
                        </span>
                        <div>
                            <h4 className="h5">Opretter underopgave</h4>
                            <p className="body-sm mt-1">
                                Husk at angive brugertildelinger og enhed for denne underopgave nedenfor.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-[#FDECEC] border-l-4 border-[#D64545] rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <span className="text-[#D64545] text-lg">
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                        </span>
                        <p className="body-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-1">
                <div className="space-y-6">
                    {/* Project Section */}
                    {!isSubtask && (
                        <ProjectPickerCard
                            projectId={projectId}
                            onProjectChange={setProjectId}
                        />
                    )}

                    {/* Basic Info Section */}
                    <BasicInfoSection
                        title={formData.title}
                        description={formData.description}
                        priority={formData.priority}
                        deadline={formData.deadline}
                        isRecurring={isRecurring}
                        onFieldChange={handleBasicInfoFieldChange}
                    />

                    {/* Assignment Section */}
                    <AssignmentCard
                        assignedUsers={formData.assigned_users}
                        onAssignedUsersChange={handleAssignedUsersChange}
                        creationMode={creationMode}
                        onCreationModeChange={setCreationMode}
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
                            startDate={formData.start_date}
                            onStartDateChange={handleStartDateChange}
                        />
                    )}
                </div>
            </div>

            {/* Fixed Footer with Actions */}
            <div className="mt-6 pt-6 border-t border-[#E8E6E1] bg-white">
                <div className="flex flex-col-reverse sm:flex-row-reverse gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-[#0f6e56] px-5 py-3 btn-lg text-white
                        hover:bg-[#0a5551] transition-colors
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D9F6F]/30 focus-visible:ring-offset-2
                        disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
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
                                {creationMode === "individual" && formData.assigned_users.length >= 2
                                    ? `Opret ${formData.assigned_users.length} Opgaver`
                                    : `Opret ${isRecurring ? 'Gentagende Opgave' : isSubtask ? 'Delopgave' : 'Opgave'}`}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="inline-flex w-full justify-center rounded-lg bg-white px-5 py-3 btn-lg text-[#1B1D22] border-2 border-[#E8E6E1] hover:bg-[#FAFAF7] hover:border-[#E8E6E1] disabled:opacity-50 disabled:cursor-not-allowed transition-all sm:w-auto"
                    >
                        Annuller
                    </button>
                </div>
            </div>
        </form>
    );
}
