"use client";

import { useState } from "react";
import { createTask } from "@/lib/api";
import type { Task, CreateTaskInput } from "@/types/task";
import { TaskPriority, TaskStatus } from "@/types/task";

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
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>

            <div className="grid gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Deadline</label>
                        <input
                            type="date"
                            required
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Task"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
}