"use client";

import { useState, useEffect } from "react";
import { updateTask, getTaskAssignments } from "@/lib/api";
import type { Task, UpdateTaskInput } from "@/types/task";
import { TaskPriority, TaskStatus } from "@/types/task";
import UserSelector from "./UserSelector";

interface UpdateTaskFormProps {
    task: Task;
    onSuccess: (task: Task) => void;
    onCancel: () => void;
}

export default function UpdateTaskForm({ task, onSuccess, onCancel }: UpdateTaskFormProps) {
    const [formData, setFormData] = useState<UpdateTaskInput>({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        deadline: new Date(task.deadline).toISOString().split("T")[0],
        assigned_users: [],
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
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <div className="space-y-4">
                <div>
                    <label htmlFor="update-title" className="block text-sm font-medium leading-6 text-gray-900">
                        Opgave titel *
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            id="update-title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            onBlur={() => handleFieldBlur('title')}
                            className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 px-3 ${isFieldInvalid('title')
                                ? 'ring-red-300 focus:ring-red-600'
                                : 'ring-gray-300 focus:ring-indigo-600'
                                }`}
                        />
                        {isFieldInvalid('title') && (
                            <p className="mt-1 text-sm text-red-600">Titel er påkrævet</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="update-description" className="block text-sm font-medium leading-6 text-gray-900">
                        Beskrivelse *
                    </label>
                    <div className="mt-2">
                        <textarea
                            id="update-description"
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            onBlur={() => handleFieldBlur('description')}
                            rows={3}
                            className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 px-3 ${isFieldInvalid('description')
                                ? 'ring-red-300 focus:ring-red-600'
                                : 'ring-gray-300 focus:ring-indigo-600'
                                }`}
                        />
                        {isFieldInvalid('description') && (
                            <p className="mt-1 text-sm text-red-600">Beskrivelse er påkrævet</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="update-priority" className="block text-sm font-medium leading-6 text-gray-900">
                            Prioritet
                        </label>
                        <div className="mt-2">
                            <select
                                id="update-priority"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                <option value={TaskPriority.LOW}>Lav</option>
                                <option value={TaskPriority.MEDIUM}>Mellem</option>
                                <option value={TaskPriority.HIGH}>Høj</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="update-status" className="block text-sm font-medium leading-6 text-gray-900">
                            Status
                        </label>
                        <div className="mt-2">
                            <select
                                id="update-status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                                className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                <option value={TaskStatus.PENDING}>Mangler</option>
                                <option value={TaskStatus.DONE}>Afsluttet</option>
                                <option value={TaskStatus.REJECTED}>Annulleret</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="update-deadline" className="block text-sm font-medium leading-6 text-gray-900">
                        Deadline *
                    </label>
                    <div className="mt-2">
                        <input
                            type="date"
                            id="update-deadline"
                            required
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            onBlur={() => handleFieldBlur('deadline')}
                            className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 px-3 ${isFieldInvalid('deadline')
                                ? 'ring-red-300 focus:ring-red-600'
                                : 'ring-gray-300 focus:ring-indigo-600'
                                }`}
                        />
                        {isFieldInvalid('deadline') && (
                            <p className="mt-1 text-sm text-red-600">Deadline er påkrævet</p>
                        )}
                    </div>
                </div>

                {/* User Selection Component */}
                <UserSelector
                    selectedUserIds={formData.assigned_users}
                    onSelectionChange={(userIds) => setFormData({ ...formData, assigned_users: userIds })}
                    label="Tildel til medarbejdere"
                />
            </div>

            {/* Form actions */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row-reverse gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                >
                    {loading ? "Opdaterer..." : "Opdater Opgave"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
                >
                    Annuller
                </button>
            </div>
        </form>
    );
}