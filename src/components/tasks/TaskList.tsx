"use client";

import { useEffect, useState } from "react";
import { getTasks, deleteTask } from "@/lib/api";
import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";
import CreateTaskForm from "./CreateTaskForm";

export default function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

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
                <h1 className="text-3xl font-bold">Task Management</h1>
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.task_id}
                        task={task}
                        onDelete={handleDelete}
                        onUpdate={loadTasks}
                    />
                ))}
            </div>
            <div>
                tasks count: {tasks.length}
            </div>
            {tasks.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    No tasks yet. Create your first task!
                </div>

            )}
        </div>
    );
}