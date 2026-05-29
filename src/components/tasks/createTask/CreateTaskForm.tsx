"use client";

import { useEffect, useMemo, useState } from "react";
import { createSubtask, createTask } from "@/lib/api";
import type { Task, CreateTaskInput } from "@/types/task";
import { TaskGoalType, TaskPriority, TaskStatus, TaskUnit } from "@/types/task";
import { useAuth } from "@/hooks/useAuth";
import { toIsoDate, toDateKey } from "@/helpers/helpers";
import { RecurrenceFrequency } from "@/types/recuringTemplate";
import BasicInfoSection from "./BasicInfoCard";
import RecurringCard from "./RecurringCard";
import AssignmentCard, { type CreationMode } from "./AssignmentCard";
import { createRecurringTemplate } from "@/lib/api";
import GoalSection from "./GoalCard";
import SchedulingCard from "./SchedulingCard";
import ProjectPickerCard from "./ProjectPickerCard";
import { toast } from "sonner";
import Banner from "@/components/common/Banner";
import { formatMissingRequiredFields } from "@/helpers/formValidation";

interface CreateTaskFormProps {
    formId: string;
    onLoadingChange?: (loading: boolean) => void;
    onSubmitLabelChange?: (label: string) => void;
    onSuccess: (task: Task) => void;
    onComplete?: () => void;
    parentTaskId?: string;
    parentProjectId?: string;
}

export default function CreateTaskForm({
    formId,
    onLoadingChange,
    onSubmitLabelChange,
    onSuccess,
    onComplete,
    parentTaskId,
    parentProjectId,
}: CreateTaskFormProps) {
    const { user } = useAuth();
    const [projectId, setProjectId] = useState(parentProjectId ?? "");
    const [formData, setFormData] = useState<Omit<CreateTaskInput, "project_id" | "goal">>({
        parent_task_id: parentTaskId || undefined,
        title: "",
        description: "",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        deadline: toDateKey(new Date()),
        created_by: user?.user_id || "",
        assigned_users: [],
        start_date: toDateKey(new Date()),
    });
    const [goalEnabled, setGoalEnabled] = useState(false);
    const [goalUnit, setGoalUnit] = useState<TaskUnit>(TaskUnit.NONE);
    const [goalTarget, setGoalTarget] = useState<number | undefined>(undefined);
    const [goalCurrent, setGoalCurrent] = useState<number | undefined>(undefined);

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
    const [showMissingRequiredBanner, setShowMissingRequiredBanner] = useState(false);

    const isSubtask = !!parentTaskId;
    const missingRequiredFields = useMemo(() => {
        const fields: string[] = [];
        if (!formData.title.trim()) fields.push("titel");
        if (!formData.description.trim()) fields.push("beskrivelse");
        if (!isSubtask && !projectId) fields.push("projekt");
        if (formData.assigned_users.length === 0) fields.push("ansvarlig");
        if (!isRecurring && !formData.deadline) fields.push("deadline");
        return fields;
    }, [formData.assigned_users.length, formData.deadline, formData.description, formData.title, isRecurring, isSubtask, projectId]);

    const missingRequiredText = useMemo(() => {
        return formatMissingRequiredFields(missingRequiredFields);
    }, [missingRequiredFields]);

    const submitLabel = useMemo(() => {
        if (creationMode === "individual" && formData.assigned_users.length >= 2) {
            return `Opret ${formData.assigned_users.length} Opgaver`;
        }
        if (isRecurring) return "Opret gentagende opgave";
        if (isSubtask) return "Opret delopgave";
        return "Opret opgave";
    }, [creationMode, formData.assigned_users.length, isRecurring, isSubtask]);

    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    useEffect(() => {
        onSubmitLabelChange?.(submitLabel);
    }, [onSubmitLabelChange, submitLabel]);

    useEffect(() => {
        if (missingRequiredFields.length === 0) {
            setShowMissingRequiredBanner(false);
        }
    }, [missingRequiredFields.length]);

    const handleGoalTypeChange = (checked: boolean) => {
        setGoalEnabled(checked);
        if (!checked) {
            setGoalUnit(TaskUnit.NONE);
            setGoalTarget(undefined);
            setGoalCurrent(undefined);
        }
    };

    const handleGoalFieldChange = (field: string, value: number | TaskUnit | undefined) => {
        if (field === "unit") setGoalUnit(value as TaskUnit ?? TaskUnit.NONE);
        else if (field === "target_quantity") setGoalTarget(value as number | undefined);
        else if (field === "current_quantity") setGoalCurrent(value as number | undefined);
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

    function handleInvalidCapture() {
        if (missingRequiredFields.length === 0) return;
        setShowMissingRequiredBanner(true);
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (missingRequiredFields.length > 0) {
            setShowMissingRequiredBanner(true);
            setError(null);
            return;
        }

        if (
            goalEnabled &&
            goalUnit !== TaskUnit.NONE &&
            (goalTarget == null || goalTarget <= 0)
        ) {
            setError("Mål skal være et tal større end 0.");
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
                    unit: goalEnabled ? goalUnit : TaskUnit.NONE,
                    target_quantity: goalEnabled && goalTarget != null ? goalTarget : undefined,
                    goal_type: goalEnabled ? TaskGoalType.FIXED : TaskGoalType.OPEN,
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
                toast.success("Gentagende opgave oprettet");
                onComplete?.();
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
                goal: goalEnabled
                    ? { target_quantity: goalTarget ?? (goalUnit === TaskUnit.NONE ? 100 : 0), unit: goalUnit, current_quantity: goalCurrent }
                    : undefined,
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
        <form id={formId} onSubmit={handleSubmit} onInvalidCapture={handleInvalidCapture} className="flex flex-col h-full">
            {isSubtask && (
                <Banner
                    variant="info"
                    title="Opretter underopgave"
                    className="mb-6"
                >
                    Husk at angive brugertildelinger og enhed for denne underopgave nedenfor.
                </Banner>
            )}

            {showMissingRequiredBanner && missingRequiredFields.length > 0 && (
                <Banner
                    variant="warning"
                    title="Opgaven mangler oplysninger"
                    className="mb-6"
                >
                    Tilføj {missingRequiredText} før opgaven kan oprettes.
                </Banner>
            )}

            {error && (
                <Banner variant="warning" className="mb-6">
                    {error}
                </Banner>
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
                            goalEnabled={goalEnabled}
                            targetQuantity={goalTarget}
                            unit={goalUnit}
                            currentQuantity={goalCurrent}
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

        </form>
    );
}
