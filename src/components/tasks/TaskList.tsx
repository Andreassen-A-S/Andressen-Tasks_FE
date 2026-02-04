"use client";

import { useState, useEffect } from "react";
import { deleteTask, getTaskAssignments } from "@/lib/api";
import type { Task } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";
import { formatRelativeDate } from "@/helpers/helpers";
import Badge from "../label/badge";
import TaskAssignedUsers from "../label/taskAssignedUsers";
import Modal from "../modal/Modal";
import UpdateTaskForm from "./UpdateTaskForm";
import EditButton from "../label/editButton";

interface TaskListProps {
    tasks: Task[];
    onTaskUpdate: () => void;
    onTaskDelete: (taskId: string) => void;
}

export default function TaskList({ tasks = [], onTaskUpdate, onTaskDelete }: TaskListProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [taskAssignments, setTaskAssignments] = useState<Record<string, TaskAssignment[]>>({});

    // Load assignments for all tasks
    useEffect(() => {
        async function loadAllAssignments() {
            const assignmentPromises = tasks.map(async (task) => {
                try {
                    const assignments = await getTaskAssignments(task.task_id);
                    return { taskId: task.task_id, assignments };
                } catch (error) {
                    console.error(`Failed to fetch assignments for task ${task.task_id}:`, error);
                    return { taskId: task.task_id, assignments: [] };
                }
            });

            const results = await Promise.all(assignmentPromises);
            const assignmentMap: Record<string, TaskAssignment[]> = {};

            results.forEach(({ taskId, assignments }) => {
                assignmentMap[taskId] = assignments;
            });

            setTaskAssignments(assignmentMap);
        }

        if (tasks.length > 0) {
            loadAllAssignments();
        }
    }, [tasks]);

    function handleEditClick(task: Task) {
        setSelectedTask(task);
        setShowEditModal(true);
    }

    async function handleEditSuccess(updatedTask: Task) {
        setShowEditModal(false);
        setSelectedTask(null);

        // Refetch assignments for the updated task
        try {
            const assignments = await getTaskAssignments(updatedTask.task_id);
            setTaskAssignments(prev => ({
                ...prev,
                [updatedTask.task_id]: assignments
            }));
        } catch (error) {
            console.error("Failed to refresh assignments:", error);
        }

        onTaskUpdate(); // Notify parent to reload tasks
    }

    function handleEditCancel() {
        setShowEditModal(false);
        setSelectedTask(null);
    }

    async function handleDelete(id: string) {
        if (!confirm("Er du sikker på at du vil slette denne opgave?")) return;

        try {
            await deleteTask(id);
            // Remove assignments from state
            setTaskAssignments(prev => {
                const { [id]: deleted, ...rest } = prev;
                return rest;
            });
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
        <>
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
                                    <TaskAssignedUsers
                                        assignments={taskAssignments[task.task_id] || []}
                                        loading={!taskAssignments[task.task_id]}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    {formatRelativeDate(task.deadline)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-3">
                                        <EditButton
                                            onClick={() => handleEditClick(task)}
                                            ariaLabel={`Rediger opgave: ${task.title}`}
                                        />
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

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={handleEditCancel}
                title="Rediger Opgave"
                maxWidth="lg"
            >
                {selectedTask && (
                    <UpdateTaskForm
                        task={selectedTask}
                        onSuccess={handleEditSuccess}
                        onCancel={handleEditCancel}
                    />
                )}
            </Modal>
        </>
    );
}