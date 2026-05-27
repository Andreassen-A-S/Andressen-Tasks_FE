"use client";

import { useEffect, useMemo, useState } from "react";
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
import Banner from "@/components/common/Banner";
import { formatMissingRequiredFields } from "@/helpers/formValidation";

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
            <Banner
                variant="info"
                title="Du redigerer en gentagende opgaveskabelon"
                className="mb-4"
            >
                Ændringer bruges på fremtidige opgaver, der oprettes fra skabelonen.
            </Banner>

            {showMissingRequiredBanner && missingRequiredFields.length > 0 && (
                <Banner variant="warning" className="mb-4">
                    Tilføj {missingRequiredText} før skabelonen kan gemmes.
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
