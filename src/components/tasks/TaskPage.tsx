"use client";

import { useCallback, useEffect, useState } from "react";
import { getTasks } from "@/lib/api";
import type { Task } from "@/types/task";
import TaskList from "./taskList/TaskList";
import CreateTaskForm from "./createTask/CreateTaskForm";
import Modal from "../modal/Modal";
import Drawer from "../drawer/drawer";
import TaskDetails from "./taskDetailsView/TaskDetails";

export default function TaskPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const loadTasks = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            console.error("Failed to load tasks:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // const handleTaskCreated = useCallback((task: Task) => {
    //     setTasks((prev) => [task, ...prev]);
    //     setShowCreateModal(false);
    // }, []);

    const handleTaskCreated = useCallback(() => {
        loadTasks();
        setShowCreateModal(false);
    }, [loadTasks]);

    const handleTaskDeleted = useCallback((taskId: string) => {
        setTasks((prev) => prev.filter((t) => t.task_id !== taskId));
    }, []);

    const handleDrawerClose = useCallback(() => {
        setSelectedTaskId(null);
    }, []);

    if (loading) {
        return <div className="p-8">Indlæser opgaver...</div>;
    }

    return (
        <div className="w-full mx-auto p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-3xl font-bold">Opgaver</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                    + Ny Opgave
                </button>
            </div>

            <TaskList
                tasks={tasks}
                onTaskUpdate={loadTasks}
                onTaskDelete={handleTaskDeleted}
            />

            <Drawer open={!!selectedTaskId} onClose={handleDrawerClose}>
                {selectedTaskId && (
                    <TaskDetails taskId={selectedTaskId} onClose={handleDrawerClose} />
                )}
            </Drawer>

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Opret Ny Opgave"
                maxWidth="2xl"
            >
                <CreateTaskForm
                    onSuccess={handleTaskCreated}
                    onCancel={() => setShowCreateModal(false)}
                />
            </Modal>
        </div>
    );
}
