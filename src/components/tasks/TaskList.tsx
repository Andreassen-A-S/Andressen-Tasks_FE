"use client";

import { useEffect, useState } from "react";
import { deleteTask, getTaskAssignments } from "@/lib/api";
import type { Task } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";
import { formatRelativeDate } from "@/helpers/helpers";
import Badge from "../label/badge";
import TaskAssignedUsers from "../label/taskAssignedUsers";
import Modal from "../modal/Modal";
import UpdateTaskForm from "./UpdateTaskForm";
import EditButton from "../label/editButton";
import Drawer from "../drawer/drawer";
import TaskDetails from "./TaskDetails";

interface TaskListProps {
    tasks: Task[];
    onTaskUpdate: () => void;
    onTaskDelete: (taskId: string) => void;
}

export default function TaskList({
    tasks = [],
    onTaskUpdate,
    onTaskDelete,
}: TaskListProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [taskAssignments, setTaskAssignments] = useState<
        Record<string, TaskAssignment[]>
    >({});

    // Load assignments for all tasks
    useEffect(() => {
        async function loadAllAssignments() {
            const results = await Promise.all(
                tasks.map(async (task) => {
                    try {
                        const assignments = await getTaskAssignments(task.task_id);
                        return { taskId: task.task_id, assignments };
                    } catch (err) {
                        console.error(
                            `Failed to load assignments for task ${task.task_id}:`,
                            err
                        );
                        return { taskId: task.task_id, assignments: [] };
                    }
                })
            );

            const map: Record<string, TaskAssignment[]> = {};
            results.forEach(({ taskId, assignments }) => {
                map[taskId] = assignments;
            });

            setTaskAssignments(map);
        }

        if (tasks.length > 0) loadAllAssignments();
    }, [tasks]);

    function handleEditClick(task: Task) {
        setSelectedTask(task);
        setShowEditModal(true);
    }

    async function handleEditSuccess() {
        setShowEditModal(false);
        setSelectedTask(null);
        onTaskUpdate();
    }

    function handleEditCancel() {
        setShowEditModal(false);
        setSelectedTask(null);
    }

    async function handleDelete(taskId: string) {
        if (!confirm("Er du sikker på at du vil slette denne opgave?")) return;
        try {
            await deleteTask(taskId);
            onTaskDelete(taskId);
        } catch (error) {
            console.error("Failed to delete task:", error);
            alert("Kunne ikke slette opgaven. Prøv igen senere.");
        }
    }


    function handleTaskClick(taskId: string) {
        setSelectedTaskId(taskId);
    }

    function handleCloseDrawer() {
        setSelectedTaskId(null);
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
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">OPGAVE</th>
                            <th className="px-6 py-3 font-medium">PRIORITET</th>
                            <th className="px-6 py-3 font-medium">STATUS</th>
                            <th className="px-6 py-3 font-medium">TILDELT TIL</th>
                            <th className="px-6 py-3 font-medium">DEADLINE</th>
                            <th className="px-6 py-3 font-medium">HANDLINGER</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tasks.map((task, index) => (
                            <tr
                                key={task.task_id}
                                className={`bg-white ${index !== tasks.length - 1
                                    ? "border-b border-gray-200"
                                    : ""
                                    }`}
                            >
                                {/* TITLE + DESCRIPTION (clickable area) */}
                                <td className="px-6 py-4">
                                    <div
                                        onClick={() => handleTaskClick(task.task_id)}
                                        className="cursor-pointer group"
                                    >
                                        <div className="text-base font-semibold text-gray-900 group-hover:underline">
                                            {task.title}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {task.description}
                                        </div>
                                    </div>
                                </td>

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

            {/* Edit Task Modal */}
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

            {/* Task Details Drawer */}
            <Drawer open={!!selectedTaskId} onClose={handleCloseDrawer}>
                {selectedTaskId && (
                    <TaskDetails taskId={selectedTaskId} onClose={handleCloseDrawer} />
                )}
            </Drawer>
        </>
    );
}