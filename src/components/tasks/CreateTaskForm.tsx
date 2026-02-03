"use client";

import { useState } from "react";
import { createTask } from "@/lib/api";
import type { Task, CreateTaskInput } from "@/types/task";
import { TaskPriority, TaskStatus } from "@/types/task";
import UserSelector from "./UserSelector";

interface CreateTaskFormProps {
    onSuccess: (task: Task) => void;
    onCancel: () => void;
}

export default function CreateTaskForm({ onSuccess, onCancel }: CreateTaskFormProps) {
    const [formData, setFormData] = useState<CreateTaskInput>({
        title: "",
        description: "",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        deadline: new Date().toISOString().split("T")[0],
        created_by: "512db100-3994-478c-972f-e9ffea28c7ac", // TODO: Replace with actual user ID
        assigned_users: [],
    });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            // Convert date to ISO-8601 DateTime
            const taskData = {
                ...formData,
                deadline: new Date(formData.deadline + 'T23:59:59.000Z').toISOString(),
            };
            const newTask = await createTask(taskData);
            onSuccess(newTask);
        } catch (error) {
            console.error("Failed to create task:", error);
            alert("Failed to create task");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                        Opgave titel*
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            id="title"
                            placeholder="Indtast titel..."
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                        Beskrivelse*
                    </label>
                    <div className="mt-2">
                        <textarea
                            id="description"
                            required
                            placeholder="Indtast beskrivelse..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium leading-6 text-gray-900">
                            Prioritet
                        </label>
                        <div className="mt-2">
                            <select
                                id="priority"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                <option value="LOW">Lav</option>
                                <option value="MEDIUM">Mellem</option>
                                <option value="HIGH">Høj</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="deadline" className="block text-sm font-medium leading-6 text-gray-900">
                            Deadline
                        </label>
                        <div className="mt-2">
                            <input
                                type="date"
                                id="deadline"
                                required
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 invalid:ring-red-500 invalid:ring-2 sm:text-sm sm:leading-6 px-3"
                            />
                        </div>
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
                    {loading ? "Opretter..." : "Opret Opgave"}
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