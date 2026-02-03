"use client";

import { useState, useEffect } from "react";
import { updateTask, deleteTask, getTaskAssignments } from "@/lib/api";
import type { Task } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";
import { formatRelativeDate } from "@/helpers/helpers";
import Badge from "../label/badge";
import TaskAssignedUsers from "../label/taskAssignedUsers";

interface TaskListProps {
    tasks: Task[];
    onTaskUpdate: () => void;
    onTaskDelete: (taskId: string) => void;
}

export default function TaskList({ tasks = [], onTaskUpdate, onTaskDelete }: TaskListProps) {
    const [assignments, setAssignments] = useState<Record<string, TaskAssignment[]>>({});
    const [loadingAssignments, setLoadingAssignments] = useState<Record<string, boolean>>({});

    // Load assignments for all tasks
    useEffect(() => {
        async function loadAssignments() {
            const assignmentPromises = tasks.map(async (task) => {
                if (!assignments[task.task_id]) {
                    setLoadingAssignments(prev => ({ ...prev, [task.task_id]: true }));
                    try {
                        const taskAssignments = await getTaskAssignments(task.task_id);
                        setAssignments(prev => ({ ...prev, [task.task_id]: taskAssignments }));
                    } catch (error) {
                        console.error(`Failed to fetch assignments for task ${task.task_id}:`, error);
                        setAssignments(prev => ({ ...prev, [task.task_id]: [] }));
                    } finally {
                        setLoadingAssignments(prev => ({ ...prev, [task.task_id]: false }));
                    }
                }
            });

            await Promise.all(assignmentPromises);
        }

        if (tasks.length > 0) {
            loadAssignments();
        }
    }, [tasks]);

    async function handleEdit(id: string, updates: Partial<Task>) {
        try {
            await updateTask(id, updates);
            onTaskUpdate(); // Notify parent to reload tasks
        } catch (error) {
            console.error("Failed to update task:", error);
            alert("Failed to update task");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Er du sikker på at du vil slette denne opgave?")) return;

        try {
            await deleteTask(id);
            onTaskDelete(id); // Notify parent to remove task from state
        } catch (error) {
            console.error("Failed to delete task:", error);
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