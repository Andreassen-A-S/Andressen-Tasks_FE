"use client";

import { useEffect, useState } from "react";
import { getTasks, deleteTask, updateTask } from "@/lib/api";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";
import CreateTaskForm from "./CreateTaskForm";
import { formatRelativeDate } from "@/helpers/helpers";

export default function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    useEffect(() => {
        loadTasks();
    }, []);

    async function loadTasks() {
        try {
            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            console.error("Failed to load tasks:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleEdit(id: string, updates: Partial<Task>) {
        try {
            await updateTask(id, updates);
            loadTasks();
        } catch (error) {
            console.error("Failed to update task:", error);
            alert("Failed to update task");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            await deleteTask(id);
            setTasks(tasks.filter(t => t.task_id !== id));
        } catch (error) {
            console.error("Failed to delete task:", error);
            alert("Failed to delete task");
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8">Loading tasks...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-black">Opgaver</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    {showForm ? "Cancel" : "New Task"}
                </button>
            </div>

            {showForm && (
                <CreateTaskForm
                    onSuccess={(newTask) => {
                        setTasks([newTask, ...tasks]);
                        setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left px-4 py-2 border-b">OPGAVE</th>
                            <th className="text-left px-4 py-2 border-b">PRIORITET</th>
                            <th className="text-left px-4 py-2 border-b">STATUS</th>
                            <th className="text-left px-4 py-2 border-b">DEADLINE</th>
                            <th className="text-left px-4 py-2 border-b">HANDLINGER</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => (
                            <tr key={task.task_id} className="border-b">
                                <td className="px-4 py-2">
                                    <div>
                                        <div className="font-medium">{task.title}</div>
                                        <div className="text-sm text-gray-500">{task.description}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-2">{task.priority}</td>
                                <td className="px-4 py-2">{task.status}</td>
                                <td className="px-4 py-2">{formatRelativeDate(task.deadline)}</td>
                                <td className="px-4 py-2">
                                    <button
                                        className="text-blue-600 hover:underline mr-3"
                                        onClick={() => setEditingTask(task)}
                                    >
                                        Rediger
                                    </button>
                                    <button
                                        className="text-red-600 hover:underline"
                                        onClick={() => handleDelete(task.task_id)}
                                    >
                                        Slet
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {tasks.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    No tasks yet. Create your first task!
                </div>
            )}
        </div>
    );
}
