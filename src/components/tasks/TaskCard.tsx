"use client";

import { TaskStatus, type Task } from "@/types/task";
import { updateTask } from "@/lib/api";

interface TaskCardProps {
    task: Task;
    onDelete: (id: string) => void;
    onUpdate: () => void;
}

export default function TaskCard({ task, onDelete, onUpdate }: TaskCardProps) {
    const priorityColors = {
        HIGH: "bg-red-100 text-red-800",
        MEDIUM: "bg-yellow-100 text-yellow-800",
        LOW: "bg-green-100 text-green-800",
    };

    const statusColors = {
        DONE: "bg-green-500",
        PENDING: "bg-yellow-500",
        REJECTED: "bg-red-500",
    };

    async function toggleStatus() {
        const newStatus = task.status === TaskStatus.DONE ? TaskStatus.PENDING : TaskStatus.DONE;
        try {
            await updateTask(task.task_id, { status: newStatus });
            onUpdate();
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    }

    return (
        <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <span className={`px-2 py-1 rounded text-xs ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
            </div>

            <p className="text-gray-600 text-sm mb-3">{task.description}</p>

            <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${statusColors[task.status]}`} />
                <span className="text-sm text-gray-600">{task.status}</span>
            </div>

            <div className="text-xs text-gray-500 mb-3">
                Deadline: {new Date(task.deadline).toLocaleDateString()}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={toggleStatus}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                    {task.status === "DONE" ? "Reopen" : "Complete"}
                </button>
                <button
                    onClick={() => onDelete(task.task_id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}