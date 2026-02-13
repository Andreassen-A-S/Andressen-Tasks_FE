"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteTask, getTaskAssignments } from "@/lib/api";
import type { Task } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";
import Modal from "../../modal/Modal";
import UpdateTaskForm from "../updateTaskView/UpdateTaskForm";
import Drawer from "../../drawer/drawer";
import TaskDetails from "../taskDetailsView/TaskDetails";
import ParentTaskRow from "./ParentTaskRow";
import RecurringTaskRow from "./RecuringTaskRow";

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

    // Group tasks into parents and subtasks
    const { parents, subtasksMap } = useMemo(() => {
        const parents: Task[] = [];
        const subtasksMap: Record<string, Task[]> = {};

        tasks.forEach(task => {
            if (task.parent_task_id) {
                if (!subtasksMap[task.parent_task_id]) {
                    subtasksMap[task.parent_task_id] = [];
                }
                subtasksMap[task.parent_task_id].push(task);
            } else {
                parents.push(task);
            }
        });

        return { parents, subtasksMap };
    }, [tasks]);

    // Load assignments for all tasks
    useEffect(() => {
        let active = true;

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

            if (active) {
                setTaskAssignments(map);
            }
        }

        if (tasks.length > 0) {
            loadAllAssignments();
        }

        return () => {
            active = false;
        };
    }, [tasks]);

    function handleEditClick(task: Task) {
        setSelectedTask(task);
        setShowEditModal(true);
    }

    function handleEditSuccess() {
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
            <div className="bg-white  rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th></th>
                                <th className="py-3 font-medium">OPGAVE</th>
                                <th className="px-6 py-3 font-medium">PRIORITET</th>
                                <th className="px-6 py-3 font-medium">STATUS</th>
                                <th className="px-6 py-3 font-medium">TILDELT TIL</th>
                                <th className="px-6 py-3 font-medium">START DATO</th>
                                <th className="px-6 py-3 font-medium">DEADLINE</th>
                                <th className="px-6 py-3 font-medium">HANDLINGER</th>
                            </tr>
                        </thead>

                        <tbody>
                            {parents.map((task) => {
                                const TaskRowComponent = task.recurring_template_id
                                    ? RecurringTaskRow
                                    : ParentTaskRow;

                                return (
                                    <TaskRowComponent
                                        key={task.task_id}
                                        task={task}
                                        subtasks={subtasksMap[task.task_id] || []}
                                        taskAssignments={taskAssignments}
                                        onTaskClick={handleTaskClick}
                                        onEditClick={handleEditClick}
                                        onDeleteClick={handleDelete}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Task Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={handleEditCancel}
                title="Rediger Opgave"
                maxWidth="3xl"
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