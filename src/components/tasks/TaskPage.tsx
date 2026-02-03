"use client";

import { useState, useEffect } from "react";
import { getTasks } from "@/lib/api";
import type { Task } from "@/types/task";
import TaskList from "./TaskList";
import CreateTaskForm from "./CreateTaskForm";
import Modal from "../modal/Modal";

export default function TaskPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

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

    function handleTaskCreated(newTask: Task) {
        setTasks([newTask, ...tasks]);
        setShowCreateModal(false);
    }

    function handleTaskUpdated() {
        loadTasks(); // Reload tasks after update
    }

    function handleTaskDeleted(taskId: string) {
        setTasks(tasks.filter(t => t.task_id !== taskId));
    }

    if (loading) {
        return <div className="flex justify-center p-8">Indlæser opgaver...</div>;
    }

    return (
        <div className="max-w-full mx-auto p-12">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-black">Opgaver</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="font-bold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                    + Ny Opgave
                </button>
            </div>

            {/* Task List Component */}
            <TaskList
                tasks={tasks}
                onTaskUpdate={handleTaskUpdated}
                onTaskDelete={handleTaskDeleted}
            />

            {/* Create Task Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Opret Ny Opgave"
                maxWidth="lg"
            >
                <CreateTaskForm
                    onSuccess={handleTaskCreated}
                    onCancel={() => setShowCreateModal(false)}
                />
            </Modal>
        </div>
    );
}