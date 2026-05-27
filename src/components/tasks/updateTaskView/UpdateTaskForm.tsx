"use client";

import { useState, useEffect, useMemo } from "react";
import { updateTask, getTaskAssignments } from "@/lib/api";
import type { Task, UpdateTaskInput } from "@/types/task";
import { TaskGoalType, TaskPriority, TaskUnit } from "@/types/task";
import { removeUndefined, toIsoDate, toDateKey } from "@/helpers/helpers";
import BasicInfoSection from "../createTask/BasicInfoCard";
import AssignmentCard from "../createTask/AssignmentCard";
import GoalSection from "../createTask/GoalCard";
import SchedulingCard from "../createTask/SchedulingCard";
import ProjectPickerCard from "../createTask/ProjectPickerCard";
import { TaskStatus } from "@/types/task";
import { toast } from "sonner";
import InlineLoadingState from "@/components/common/loading/InlineLoadingState";
import Banner from "@/components/common/Banner";
import { formatMissingRequiredFields } from "@/helpers/formValidation";

interface UpdateTaskFormProps {
    formId: string;
    onLoadingChange?: (loading: boolean) => void;
    task: Task;
    onSuccess: (task: Task) => void;
}

export default function UpdateTaskForm({ formId, onLoadingChange, task, onSuccess }: UpdateTaskFormProps) {
    const isSubtask = !!task.parent_task_id;
    const isRecurringInstance = !!task.recurring_template_id;

    const [formData, setFormData] = useState<UpdateTaskInput>({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        deadline: toDateKey(task.deadline),
        assigned_users: [],
        start_date: toDateKey(task.start_date),
        unit: task.unit,
        goal_type: task.goal_type || TaskGoalType.OPEN,
        target_quantity: task.target_quantity ?? undefined,
        current_quantity: task.current_quantity ?? 0,
    });

    const [projectId, setProjectId] = useState(task.project_id);
    const [loading, setLoading] = useState(false);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMissingRequiredBanner, setShowMissingRequiredBanner] = useState(false);
    const missingRequiredFields = useMemo(() => {
        const fields: string[] = [];
        if (!formData.title?.trim()) fields.push("titel");
        if (!formData.description?.trim()) fields.push("beskrivelse");
        if (!isSubtask && !projectId) fields.push("projekt");
        if (!formData.deadline) fields.push("deadline");
        return fields;
    }, [formData.deadline, formData.description, formData.title, isSubtask, projectId]);
    const missingRequiredText = useMemo(() => formatMissingRequiredFields(missingRequiredFields), [missingRequiredFields]);

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

    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    useEffect(() => {
        if (missingRequiredFields.length === 0) setShowMissingRequiredBanner(false);
    }, [missingRequiredFields.length]);

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

    // Centralized handler for Start date
    const handleStartDateChange = (date: string) => {
        setFormData(prev => ({ ...prev, start_date: date }));
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
            const taskData = removeUndefined({
                ...formData,
                project_id: projectId,
                deadline: formData.deadline ? toIsoDate(formData.deadline) : undefined,
                start_date: toIsoDate(formData.start_date || toDateKey(new Date())),
            });
            const updatedTask = await updateTask(task.task_id, taskData);
            toast.success("Opgave opdateret");
            onSuccess(updatedTask);
        } catch (error) {
            console.error("Failed to update task:", error);
            setError("Kunne ikke opdatere opgaven. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    function handleInvalidCapture() {
        if (missingRequiredFields.length === 0) return;
        setShowMissingRequiredBanner(true);
        setError(null);
    }

    if (loadingAssignments) {
        return (
            <InlineLoadingState label="Indlæser opgave data..." centered className="py-8" />
        );
    }

    return (
        <form id={formId} onSubmit={handleSubmit} onInvalidCapture={handleInvalidCapture} className="flex flex-col h-full">
            {isRecurringInstance && (
                <Banner
                    variant="info"
                    title="Gentagende opgave instans"
                    className="mb-6"
                >
                    Dette er en instans af en gentagende opgave. Ændringer påvirker kun denne specifikke instans.
                </Banner>
            )}

            {isSubtask && (
                <Banner
                    variant="success"
                    title="Redigerer underopgave"
                    className="mb-6"
                >
                    Denne opgave er en underopgave af en større opgave.
                </Banner>
            )}

            {showMissingRequiredBanner && missingRequiredFields.length > 0 && (
                <Banner variant="warning" className="mb-6">
                    Tilføj {missingRequiredText} før opgaven kan gemmes.
                </Banner>
            )}

            {error && (
                <Banner variant="warning" className="mb-6">
                    {error}
                </Banner>
            )}

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto">
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
                        startDate={formData.start_date}
                        onStartDateChange={handleStartDateChange}
                    />
                </div>
            </div>

        </form>
    );
}
