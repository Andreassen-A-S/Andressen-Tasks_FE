"use client";

import { updateTask, deleteTask } from "@/lib/api";
import type { Task } from "@/types/task";
import { formatRelativeDate } from "@/helpers/helpers";
import Badge from "../label/badge";
import TaskAssignedUsers from "../label/taskAssignedUsers";

interface TaskListProps {
    tasks: Task[];
    onTaskUpdate: () => void;
    onTaskDelete: (taskId: string) => void;
}

export default function TaskList({ tasks = [], onTaskUpdate, onTaskDelete }: TaskListProps) {
    async function handleEdit(id: string, updates: Partial<Task>) {
        try {
            await updateTask(id, updates);
            onTaskUpdate(); // Notify parent to reload tasks
        } catch (error) {
            console.error("Kunne ikke opdatere opgaven:", error);
            alert("Kunne ikke opdatere opgaven");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Er du sikker på at du vil slette denne opgave?")) return;

        try {
            await deleteTask(id);
            onTaskDelete(id); // Notify parent to remove task from state
        } catch (error) {
            console.error("Kunne ikke slette opgaven:", error);
            alert("Kunne ikke slette opgaven");
        }
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center text-gray-500 mt-8">
                Ingen opgaver endnu. Opret din første opgave!
            </div>
        );
    }

    return (
        <div className="relative overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-sm text-gray-700 bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th scope="col" className="px-6 py-3 font-medium">
                            OPGAVE
                        </th>
                        <th scope="col" className="px-6 py-3 font-medium">
                            PRIORITET
                        </th>
                        <th scope="col" className="px-6 py-3 font-medium">
                            STATUS
                        </th>
                        <th scope="col" className="px-6 py-3 font-medium">
                            TILDELT TIL
                        </th>
                        <th scope="col" className="px-6 py-3 font-medium">
                            DEADLINE
                        </th>
                        <th scope="col" className="px-6 py-3 font-medium">
                            HANDLINGER
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task, index) => (
                        <tr
                            key={task.task_id}
                            className={`bg-white hover:bg-gray-50 transition-colors ${index !== tasks.length - 1 ? 'border-b border-gray-200' : ''
                                }`}
                        >
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                <div>
                                    <div className="text-base font-semibold">{task.title}</div>
                                    <div className="text-sm text-gray-500 font-normal mt-1">{task.description}</div>
                                </div>
                            </th>
                            <td className="px-6 py-4">
                                <Badge variant="priority" value={task.priority} />
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant="status" value={task.status} />
                            </td>
                            <td className="px-6 py-4">
                                <TaskAssignedUsers taskId={task.task_id} />
                            </td>
                            <td className="px-6 py-4">
                                {formatRelativeDate(task.deadline)}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-3">
                                    <button
                                        className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                                        onClick={() => {
                                            console.log("Edit task:", task.task_id);
                                        }}
                                    >
                                        Rediger
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                                        onClick={() => handleDelete(task.task_id)}
                                    >
                                        Slet
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}