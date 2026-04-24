"use client";

import { useEffect, useState } from "react";
import { updateRecurringTemplate } from "@/lib/api";
import { RecurringTemplate } from "@/types/recuringTemplate";
import { TaskGoalType, TaskPriority, TaskStatus, TaskUnit } from "@/types/task";
import { toIsoDate, toDateKey } from "@/helpers/helpers";
import BasicInfoSection from "@/components/tasks/createTask/BasicInfoCard";
import AssignmentCard from "@/components/tasks/createTask/AssignmentCard";
import GoalSection from "@/components/tasks/createTask/GoalCard";
import RecurringCard from "@/components/tasks/createTask/RecurringCard";
import ProjectPickerCard from "@/components/tasks/createTask/ProjectPickerCard";
import { UpdateRecurringTemplateInput } from "@/types/recuringTemplate";
import { toast } from "sonner";
import { colors } from "@/constants/colors";

interface UpdateTemplateFormProps {
    formId: string;
    onLoadingChange?: (loading: boolean) => void;
    template: RecurringTemplate;
    onSuccess: (template: RecurringTemplate) => void;
}

export default function UpdateTemplateForm({ formId, onLoadingChange, template, onSuccess }: UpdateTemplateFormProps) {

    const [formData, setFormData] = useState({
        title: template.title,
        description: template.description || "",
        priority: template.priority,
        assigned_users: template.default_assignees?.map(a => a.user_id) || [],
        unit: template.unit !== TaskUnit.NONE ? template.unit : undefined,
        goal_type: template.goal_type || TaskGoalType.OPEN,
        target_quantity: template.target_quantity || undefined,
        current_quantity: undefined as number | undefined,
    });

    const [recurringData, setRecurringData] = useState({
        frequency: template.frequency,
        interval: template.interval,
        days_of_week: template.days_of_week || [],
        day_of_month: template.day_of_month || undefined,
        start_date: template.start_date ? toDateKey(template.start_date) : toDateKey(new Date()),
        end_date: template.end_date ? toDateKey(template.end_date) : undefined,
    });

    const [projectId, setProjectId] = useState(template.project_id);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

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
            const templateData: UpdateRecurringTemplateInput = {
                title: formData.title,
                project_id: projectId,
                description: formData.description || undefined,
                priority: formData.priority,
                unit: formData.unit || TaskUnit.NONE,
                target_quantity: formData.target_quantity,
                goal_type: formData.goal_type || TaskGoalType.OPEN,
                assigned_users: formData.assigned_users,
                frequency: recurringData.frequency,
                interval: recurringData.interval,
                start_date: toIsoDate(recurringData.start_date),
                end_date: recurringData.end_date ? toIsoDate(recurringData.end_date) : null,
            };

            const updatedTemplate = await updateRecurringTemplate(template.id, templateData);
            toast.success("Skabelon opdateret");
            onSuccess(updatedTemplate);
        } catch (err) {
            console.error("Failed to update template:", err);
            const errorMessage = err instanceof Error
                ? err.message
                : "Kunne ikke opdatere skabelon. Prøv igen.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }

    }



    return (
        <form id={formId} onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            {/* Error Message */}
            {error && (
                <div
                    className="mb-4 rounded-md border px-4 py-3"
                    style={{
                        borderColor: colors.red,
                        backgroundColor: colors.redLight,
                    }}
                >
                    <p className="body-sm" style={{ color: colors.red }}>{error}</p>
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
        </form>
    );
}
