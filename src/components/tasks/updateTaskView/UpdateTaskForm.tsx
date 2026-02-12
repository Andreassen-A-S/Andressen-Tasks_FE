"use client";

import { useState, useEffect } from "react";
import { updateTask, getTaskAssignments } from "@/lib/api";
import type { Task, UpdateTaskInput } from "@/types/task";
import { TaskGoalType, TaskPriority, TaskUnit } from "@/types/task";
import UserSelector from "./UserSelector";

interface UpdateTaskFormProps {
    task: Task;
    onSuccess: (task: Task) => void;
    onCancel: () => void;
}

export default function UpdateTaskForm({ task, onSuccess, onCancel }: UpdateTaskFormProps) {
    const isSubtask = !!task.parent_task_id;

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
        target_quantity: task.target_quantity || undefined,
        current_quantity: task.current_quantity ?? 0,
    });
    const [loading, setLoading] = useState(false);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [touched, setTouched] = useState({
        title: false,
        description: false,
        deadline: false,
    });

    // Load current assignments
    useEffect(() => {
        async function loadAssignments() {
            try {
                const assignments = await getTaskAssignments(task.task_id);
                const assignedUserIds = assignments.map(a => a.user_id);
                setFormData(prev => ({ ...prev, assigned_users: assignedUserIds }));
            } catch (error) {
                console.error("Failed to load task assignments:", error);
            } finally {
                setLoadingAssignments(false);
            }
        }

        loadAssignments();
    }, [task.task_id]);

    // Validation helper
    const isFieldInvalid = (fieldName: keyof typeof touched) => {
        return touched[fieldName] && !formData[fieldName];
    };

    const handleFieldBlur = (fieldName: keyof typeof touched) => {
        setTouched({ ...touched, [fieldName]: true });
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Mark all required fields as touched on submit
        setTouched({
            title: true,
            description: true,
            deadline: true,
        });

        // Check if any required fields are empty
        if (!formData.title || !formData.description || !formData.deadline) {
            return; // Don't submit if validation fails
        }

        setLoading(true);

        try {
            // Convert date to ISO-8601 DateTime
            const taskData = {
                ...formData,
                deadline: new Date(formData.deadline + 'T23:59:59.000Z').toISOString(),
                scheduled_date: formData.scheduled_date ? new Date(formData.scheduled_date + 'T23:59:59.000Z').toISOString() : undefined,
            };
            const updatedTask = await updateTask(task.task_id, taskData);
            onSuccess(updatedTask);
        } catch (error) {
            console.error("Failed to update task:", error);
            alert("Kunne ikke opdatere opgaven");
        } finally {
            setLoading(false);
        }
    }

    if (loadingAssignments) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">Indlæser opgave data...</div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-6">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b-2 border-gray-200">
                            Opgave Detaljer
                        </h3>

                        {/* Title */}
                        <div>
                            <label htmlFor="update-title" className="block text-sm font-semibold text-gray-900 mb-2">
                                Opgave titel<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="update-title"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                onBlur={() => handleFieldBlur('title')}
                                className={`block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors ${isFieldInvalid('title')
                                    ? 'border-red-300 focus:border-red-600'
                                    : ''
                                    }`}
                            />
                            {isFieldInvalid('title') && (
                                <p className="mt-1 text-sm text-red-600">Titel er påkrævet</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="update-description" className="block text-sm font-semibold text-gray-900 mb-2">
                                Beskrivelse<span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="update-description"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                onBlur={() => handleFieldBlur('description')}
                                rows={4}
                                className={`block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors resize-y ${isFieldInvalid('description')
                                    ? 'border-red-300 focus:border-red-600'
                                    : ''
                                    }`}
                            />
                            {isFieldInvalid('description') && (
                                <p className="mt-1 text-sm text-red-600">Beskrivelse er påkrævet</p>
                            )}
                        </div>

                        {/* Priority & Deadline */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="update-priority" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Prioritet
                                </label>
                                <select
                                    id="update-priority"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                    className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                                >
                                    <option value={TaskPriority.LOW}>Lav</option>
                                    <option value={TaskPriority.MEDIUM}>Mellem</option>
                                    <option value={TaskPriority.HIGH}>Høj</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="update-deadline" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Deadline<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="update-deadline"
                                    required
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    onBlur={() => handleFieldBlur('deadline')}
                                    className={`block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors ${isFieldInvalid('deadline')
                                        ? 'border-red-300 focus:border-red-600'
                                        : ''
                                        }`}
                                />
                                {isFieldInvalid('deadline') && (
                                    <p className="mt-1 text-sm text-red-600">Deadline er påkrævet</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Assignment Section (Parent tasks only) */}
                    {/* {!isSubtask && ( */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b-2 border-gray-200">
                            Tildel til Medarbejdere
                        </h3>
                        <UserSelector
                            selectedUserIds={formData.assigned_users || []}
                            onSelectionChange={(userIds) => setFormData({ ...formData, assigned_users: userIds })}
                            label=""
                        />
                    </div>
                    {/* // )} */}

                    {/* Advanced Options */}
                    {!isSubtask && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b-2 border-gray-200">
                                Avancerede Indstillinger
                            </h3>



                            <div>
                                <label htmlFor="goal_type" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Mål
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="goal_type"
                                        checked={formData.goal_type === TaskGoalType.FIXED}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                goal_type: e.target.checked ? TaskGoalType.FIXED : TaskGoalType.OPEN,
                                            })
                                        }
                                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <label htmlFor="goal_type" className="text-sm text-gray-900">
                                        Fast mål (afslut ved nået mængde)
                                    </label>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Slå til hvis opgaven skal afsluttes ved målmængde. Ellers afsluttes den manuelt.
                                </p>
                            </div>

                            {/* Show these fields only when goal_type is FIXED */}
                            {formData.goal_type === TaskGoalType.FIXED && (
                                <>
                                    <div>
                                        <label htmlFor="unit" className="block text-sm font-semibold text-gray-900 mb-2">
                                            Enhed
                                        </label>
                                        <select
                                            id="unit"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value as TaskUnit })}
                                            className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                                        >
                                            <option value={TaskUnit.NONE}>Ingen</option>
                                            <option value={TaskUnit.HOURS}>Timer</option>
                                            <option value={TaskUnit.METERS}>Meter</option>
                                            <option value={TaskUnit.KILOMETERS}>Kilometer</option>
                                            <option value={TaskUnit.LITERS}>Liter</option>
                                            <option value={TaskUnit.KILOGRAMS}>Kilogram</option>
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">Valgfrit: Måleenhed for målmængde</p>
                                    </div>
                                    <div>
                                        <label htmlFor="target_quantity" className="block text-sm font-semibold text-gray-900 mb-2">
                                            Målmængde<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="target_quantity"
                                            placeholder="F.eks. 100"
                                            required
                                            value={formData.target_quantity ?? ""}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                target_quantity: e.target.value ? Number(e.target.value) : undefined
                                            })}
                                            className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Påkrævet når fast mål er aktiveret</p>
                                    </div>

                                    <div>
                                        <label htmlFor="current_quantity" className="block text-sm font-semibold text-gray-900 mb-2">
                                            Start fremskridt
                                        </label>
                                        <input
                                            type="number"
                                            id="current_quantity"
                                            min={0}
                                            step="any"
                                            placeholder="F.eks. 0"
                                            value={formData.current_quantity ?? ""}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                current_quantity: e.target.value ? Number(e.target.value) : 0
                                            })}
                                            className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Valgfrit: Sæt allerede udført mængde</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}


                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b-2 border-gray-200">
                            Planlægning
                        </h3>
                        <div>
                            <label htmlFor="update-scheduled_date" className="block text-sm font-semibold text-gray-900 mb-2">
                                Planlagt dato
                            </label>
                            <input
                                type="date"
                                id="update-scheduled_date"
                                value={formData.scheduled_date || ""}
                                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                            />
                            <p className="mt-1 text-xs text-gray-500">Valgfrit: Hvornår skal denne underopgave udføres?</p>
                        </div>
                    </div>

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
                        {loading ? "Opdaterer..." : "Opdater Opgave"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="inline-flex w-full justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all sm:w-auto"
                    >
                        Annuller
                    </button>
                </div>
            </div>
        </form>
    );
}
