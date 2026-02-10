"use client";

import { useState } from "react";
import { createSubtask, createTask } from "@/lib/api";
import type { Task, CreateTaskInput, CreateSubtaskInput } from "@/types/task";
import { TaskGoalType, TaskPriority, TaskStatus, TaskUnit } from "@/types/task";
import UserSelector from "./updateTaskView/UserSelector";
import { useAuth } from "@/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { toIsoEndOfDay } from "@/helpers/helpers";

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
        current_quantity: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSubtask = !!parentTaskId;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let newTask;

            if (isSubtask && parentTaskId) {
                // For subtasks, create a properly typed object
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
                    goal_type: formData.goal_type,
                    target_quantity: formData.target_quantity,
                    current_quantity: formData.current_quantity,
                    parent_task_id: parentTaskId, // Required for subtasks
                };
                newTask = await createSubtask(subtaskData);
            } else {
                // For parent tasks
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
                    goal_type: formData.goal_type,
                    target_quantity: formData.target_quantity,
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
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b-2 border-gray-200">
                            Opgave Detaljer
                        </h3>

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                                Opgave titel<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                placeholder="Indtast titel..."
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                                Beskrivelse<span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                required
                                placeholder="Indtast beskrivelse..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors resize-y"
                            />
                        </div>

                        {/* Priority & Deadline */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="priority" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Prioritet
                                </label>
                                <select
                                    id="priority"
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
                                <label htmlFor="deadline" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Deadline<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="deadline"
                                    required
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assignment Section */}

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b-2 border-gray-200">
                            Tildel til Medarbejdere
                        </h3>
                        <UserSelector
                            selectedUserIds={formData.assigned_users}
                            onSelectionChange={(userIds) => setFormData({ ...formData, assigned_users: userIds })}
                            label=""
                        />
                    </div>


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
                            <label htmlFor="scheduled_date" className="block text-sm font-semibold text-gray-900 mb-2">
                                Planlagt dato
                            </label>
                            <input
                                type="date"
                                id="scheduled_date"
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
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Opretter...</span>
                            </>
                        ) : (
                            <>

                                <span>Opret {isSubtask ? 'Delopgave' : 'Opgave'}</span>
                            </>
                        )}
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
