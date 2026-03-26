"use client";

import { useState } from "react";
import { createRecurringTemplate } from "@/lib/api";
import { RecurringTemplate, RecurrenceFrequency } from "@/types/recuringTemplate";
import { TaskGoalType, TaskPriority, TaskStatus, TaskUnit } from "@/types/task";
import { toIsoEndOfDay, toLocalDateKey } from "@/helpers/helpers";
import BasicInfoSection from "@/components/tasks/createTask/BasicInfoCard";
import AssignmentCard from "@/components/tasks/createTask/AssignmentCard";
import GoalSection from "@/components/tasks/createTask/GoalCard";
import RecurringCard from "@/components/tasks/createTask/RecurringCard";
import ProjectPickerCard from "@/components/tasks/createTask/ProjectPickerCard";

interface CreateTemplateFormProps {
    onCancel: () => void;
    onSuccess: (template: RecurringTemplate) => void;
}

export default function CreateTemplateForm({ onCancel, onSuccess }: CreateTemplateFormProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: TaskPriority.MEDIUM,
        assigned_users: [] as string[],
        unit: undefined as TaskUnit | undefined,
        goal_type: TaskGoalType.OPEN,
        target_quantity: undefined as number | undefined,
        current_quantity: undefined as number | undefined,
    });

    const [recurringData, setRecurringData] = useState({
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 1,
        days_of_week: [] as number[],
        day_of_month: undefined as number | undefined,
        start_date: toLocalDateKey(new Date()),
        end_date: undefined as string | undefined,
    });

    const [projectId, setProjectId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!projectId) {
            setError("Vælg venligst et projekt.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
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
                project_id: projectId,
            };

            const template = await createRecurringTemplate(templateData);

            onSuccess(template);
        } catch (err) {
            console.error("Failed to create template:", err);
            setError("Kunne ikke oprette skabelon. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-6">

                    {/* Project */}
                    <ProjectPickerCard
                        projectId={projectId}
                        onProjectChange={setProjectId}
                    />

                    {/* Basic Info */}
                    <BasicInfoSection
                        title={formData.title}
                        description={formData.description}
                        priority={formData.priority}
                        deadline={recurringData.start_date}
                        isRecurring={true}
                        onFieldChange={handleBasicInfoFieldChange}
                    />

                    {/* Assignment */}
                    <AssignmentCard
                        assignedUsers={formData.assigned_users}
                        onAssignedUsersChange={handleAssignedUsersChange}
                    />

                    {/* Goal */}
                    <GoalSection
                        goalType={formData.goal_type}
                        targetQuantity={formData.target_quantity}
                        unit={formData.unit}
                        currentQuantity={formData.current_quantity}
                        onGoalTypeChange={handleGoalTypeChange}
                        onFieldChange={handleGoalFieldChange}
                    />

                    {/* Recurring Settings */}
                    <RecurringCard
                        isRecurring={true}
                        setIsRecurring={() => { }}
                        recurringData={recurringData}
                        setRecurringData={setRecurringData}
                        isSubtask={false}
                        hideToggle={true}
                    />
                </div>
            </div>
            {/* Fixed Footer with Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 bg-white">
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
                                Opret Gentagende Opgave
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
