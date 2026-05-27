"use client";

import { useEffect, useMemo, useState } from "react";
import { createRecurringTemplate } from "@/lib/api";
import { RecurringTemplate, RecurrenceFrequency } from "@/types/recuringTemplate";
import { TaskGoalType, TaskPriority, TaskStatus, TaskUnit } from "@/types/task";
import { toIsoDate, toDateKey } from "@/helpers/helpers";
import BasicInfoSection from "@/components/tasks/createTask/BasicInfoCard";
import AssignmentCard from "@/components/tasks/createTask/AssignmentCard";
import GoalSection from "@/components/tasks/createTask/GoalCard";
import RecurringCard from "@/components/tasks/createTask/RecurringCard";
import ProjectPickerCard from "@/components/tasks/createTask/ProjectPickerCard";
import { toast } from "sonner";
import Banner from "@/components/common/Banner";
import { formatMissingRequiredFields } from "@/helpers/formValidation";

interface CreateTemplateFormProps {
    formId: string;
    onLoadingChange?: (loading: boolean) => void;
    onSuccess: (template: RecurringTemplate) => void;
}

export default function CreateTemplateForm({ formId, onLoadingChange, onSuccess }: CreateTemplateFormProps) {
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
        start_date: toDateKey(new Date()),
        end_date: undefined as string | undefined,
    });

    const [projectId, setProjectId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMissingRequiredBanner, setShowMissingRequiredBanner] = useState(false);
    const missingRequiredFields = useMemo(() => {
        const fields: string[] = [];
        if (!formData.title.trim()) fields.push("titel");
        if (!formData.description.trim()) fields.push("beskrivelse");
        if (!projectId) fields.push("projekt");
        if (!recurringData.start_date) fields.push("startdato");
        return fields;
    }, [formData.description, formData.title, projectId, recurringData.start_date]);
    const missingRequiredText = useMemo(() => formatMissingRequiredFields(missingRequiredFields), [missingRequiredFields]);

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

        if (missingRequiredFields.length > 0) {
            setShowMissingRequiredBanner(true);
            setError(null);
            return;
        }

        if (
            formData.goal_type === TaskGoalType.FIXED &&
            (formData.unit ?? TaskUnit.NONE) !== TaskUnit.NONE &&
            (formData.target_quantity == null || formData.target_quantity <= 0)
        ) {
            setError("Mål skal være et tal større end 0.");
            return;
        }

        setLoading(true);
        setShowMissingRequiredBanner(false);
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
                start_date: toIsoDate(recurringData.start_date),
                end_date: recurringData.end_date ? toIsoDate(recurringData.end_date) : undefined,
                assigned_users: formData.assigned_users,
                project_id: projectId,
            };

            const template = await createRecurringTemplate(templateData);

            toast.success("Skabelon oprettet");
            onSuccess(template);
        } catch (err) {
            console.error("Failed to create template:", err);
            setError("Kunne ikke oprette skabelon. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (missingRequiredFields.length === 0) setShowMissingRequiredBanner(false);
    }, [missingRequiredFields.length]);

    function handleInvalidCapture() {
        if (missingRequiredFields.length === 0) return;
        setShowMissingRequiredBanner(true);
        setError(null);
    }

    return (
        <form id={formId} onSubmit={handleSubmit} onInvalidCapture={handleInvalidCapture} className="flex-1 overflow-y-auto">
            {showMissingRequiredBanner && missingRequiredFields.length > 0 && (
                <Banner variant="warning" className="mb-4">
                    Tilføj {missingRequiredText} før skabelonen kan oprettes.
                </Banner>
            )}

            {error && (
                <Banner variant="warning" className="mb-4">
                    {error}
                </Banner>
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
