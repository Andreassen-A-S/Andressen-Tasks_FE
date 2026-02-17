"use client";

import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { getTasks } from "@/lib/api";
import { TaskGoalType, TaskPriority, type Task } from "@/types/task";
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
    const [filter, setFilter] = useState<'all' | 'recurring' | 'highPriority' | 'fixedGoal' | 'hasSubtasks'>('all');

    type FilterKey = "all" | "recurring" | "highPriority" | "fixedGoal" | "hasSubtasks";

    const filterOptions: { key: FilterKey; label: string; count: number }[] = [
        { key: 'all', label: 'Alle', count: tasks.length },
        { key: 'recurring', label: 'Gentages', count: tasks.filter(t => t.recurring_template_id !== null).length },
        { key: 'highPriority', label: 'Høj prioritet', count: tasks.filter(t => t.priority === TaskPriority.HIGH).length },
        { key: 'fixedGoal', label: 'Mål-opgaver', count: tasks.filter(t => t.goal_type === TaskGoalType.FIXED).length },
        {
            key: 'hasSubtasks',
            label: 'Har delopgaver',
            count: tasks.filter(parent =>
                tasks.some(t => t.parent_task_id === parent.task_id)
            ).length
        },
    ];

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
        <div className="min-h-screen">
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="h1 flex items-center gap-3">
                            Opgaver
                        </h1>
                        <p className="body-sm">
                            {/* num of taks and num of task with status high */}
                            {tasks.length} opgaver - {tasks.filter(t => t.priority === TaskPriority.HIGH).length}  med høj prioritet
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex btn-lg items-center gap-2 px-5 py-3 bg-[#0f6e56] text-white font-semibold rounded-lg hover:bg-[#0a5551] transition-colors"
                    >
                        <FontAwesomeIcon icon={faPlus} size="sm" />
                        Ny opgave
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="mx-8 px-4 sm:px-6 lg:px-8 py-2">
                <div className="flex gap-2">
                    {filterOptions.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`label-lg-gray px-4 py-2 rounded-lg transition-colors cursor-pointer ${filter === key
                                ? 'bg-gray-900 label-lg-white'
                                : 'bg-transparent text-gray-500 border border-gray-200  hover:border-gray-300'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>


            {/* content */}
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pb-12">
                <TaskList
                    tasks={tasks.filter(t => {
                        if (filter === 'recurring') return t.recurring_template_id !== null;
                        if (filter === 'highPriority') return t.priority === TaskPriority.HIGH;
                        if (filter === 'fixedGoal') return t.goal_type === TaskGoalType.FIXED;
                        if (filter === 'hasSubtasks') {
                            // Include parents that have subtasks
                            const isParentWithSubtasks = tasks.some(st => st.parent_task_id === t.task_id);
                            // Include subtasks whose parent has subtasks (i.e. the subtask itself)
                            const isSubtask = t.parent_task_id !== null;
                            return isParentWithSubtasks || isSubtask;
                        }
                        return true;
                    })}
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
                    maxWidth="3xl"
                >
                    <CreateTaskForm
                        onSuccess={handleTaskCreated}
                        onCancel={() => setShowCreateModal(false)}
                    />
                </Modal>
            </div>
        </div>
    );
}
