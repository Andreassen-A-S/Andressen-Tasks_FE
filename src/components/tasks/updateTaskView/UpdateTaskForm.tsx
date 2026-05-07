"use client";

import { useState, useEffect } from "react";
import { updateTask, getTaskAssignments } from "@/lib/api";
import type { Task, UpdateTaskInput } from "@/types/task";
import { TaskGoalType, TaskPriority, TaskUnit } from "@/types/task";
import { Info, TriangleAlert } from "lucide-react";
import { removeUndefined, toIsoDate, toDateKey } from "@/helpers/helpers";
import BasicInfoSection from "../createTask/BasicInfoCard";
import AssignmentCard from "../createTask/AssignmentCard";
import GoalSection from "../createTask/GoalCard";
import SchedulingCard from "../createTask/SchedulingCard";
import ProjectPickerCard from "../createTask/ProjectPickerCard";
import { TaskStatus } from "@/types/task";
import { toast } from "sonner";
import InlineLoadingState from "@/components/common/loading/InlineLoadingState";

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

        if (!projectId) {
            setError("Vælg venligst et projekt.");
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

    if (loadingAssignments) {
        return (
            <InlineLoadingState label="Indlæser opgave data..." centered className="py-8" />
        );
    }

    return (
        <form id={formId} onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Info Banner for Recurring Tasks */}
            {isRecurringInstance && (
                <div className="mb-6 p-4 bg-[#EBF0FD] border-l-4 border-[#2C5FE0] rounded-r-[12px]">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 flex-shrink-0 text-[#2C5FE0]" />
                        <div>
                            <h4 className="h5">Gentagende opgave instans</h4>
                            <p className="body-sm mt-1">
                                Dette er en instans af en gentagende opgave. Ændringer påvirker kun denne specifikke instans.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Banner for Subtasks */}
            {isSubtask && (
                <div className="mb-6 p-4 bg-[#E8F7F0] border-l-4 border-[#2D9F6F] rounded-r-[12px]">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 flex-shrink-0 text-[#2D9F6F]" />
                        <div>
                            <h4 className="h5">Redigerer underopgave</h4>
                            <p className="body-sm mt-1">
                                Denne opgave er en underopgave af en større opgave.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-[#FDECEC] border-l-4 border-[#D64545] rounded-r-[12px]">
                    <div className="flex items-start gap-3">
                        <TriangleAlert className="w-5 h-5 flex-shrink-0 text-[#D64545]" />
                        <p className="body-sm">{error}</p>
                    </div>
                </div>
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
