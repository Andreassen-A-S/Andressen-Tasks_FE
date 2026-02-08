"use client";

import { Fragment, useState } from "react";
import type { Task } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";
import { formatRelativeDate } from "@/helpers/helpers";
import Badge from "../label/badge";
import TaskAssignedUsers from "../label/taskAssignedUsers";
import EditButton from "../label/editButton";

interface ParentTaskRowProps {
    task: Task;
    subtasks: Task[];
    taskAssignments: Record<string, TaskAssignment[]>;
    onTaskClick: (taskId: string) => void;
    onEditClick: (task: Task) => void;
    onDeleteClick: (taskId: string) => void;
}

export default function ParentTaskRow({
    task,
    subtasks,
    taskAssignments,
    onTaskClick,
    onEditClick,
    onDeleteClick,
}: ParentTaskRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const hasSubtasks = subtasks.length > 0;
    const progress = hasSubtasks
        ? {
            completed: subtasks.filter((st) => st.status === "DONE").length,
            total: subtasks.length,
        }
        : null;

    return (
        <Fragment>
            {/* Parent Task Row */}
            <tr className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
                {/* Title + Description */}
                <td className="px-6 py-4">
                    <div className="group">
                        <div className="flex items-center gap-2">
                            {hasSubtasks && (
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded((v) => !v)}
                                    aria-label={isExpanded ? "Skjul delopgaver" : "Vis delopgaver"}
                                    aria-expanded={isExpanded}
                                    className={`inline-flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-xs text-gray-600 transition-all ${isExpanded ? "rotate-90 bg-teal-500 text-white" : ""
                                        }`}
                                >
                                    ▶
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => onTaskClick(task.task_id)}
                                className="text-left cursor-pointer"
                            >
                                <div className="text-base font-semibold text-gray-900 group-hover:underline">
                                    {task.title}
                                </div>
                            </button>

                            {hasSubtasks && (
                                <div className="flex items-center gap-2 min-w-30">
                                    {/* Progress fraction */}
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-gray-500 rounded text-xs font-bold">
                                        {progress?.completed}/{progress?.total}
                                    </span>
                                    {/* Progress bar with dividers */}
                                    <div className="relative w-24 h-2 bg-indigo-100 rounded overflow-hidden">
                                        {/* Progress fill */}
                                        <div
                                            className="absolute left-0 top-0 h-2 bg-indigo-500 transition-all"
                                            style={{
                                                width: `${progress ? (progress.completed / progress.total) * 100 : 0}%`,
                                            }}
                                        />
                                        {/* Dividers */}
                                        {progress && progress.total > 1 &&
                                            Array.from({ length: progress.total - 1 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute top-0 bottom-0 w-0.5 bg-white"
                                                    style={{
                                                        left: `${((i + 1) / progress.total) * 100}%`,
                                                    }}
                                                />
                                            ))
                                        }
                                    </div>
                                    {/* Percentage */}
                                    <span className="text-xs font-semibold text-gray-500 ml-1">
                                        {progress ? Math.round((progress.completed / progress.total) * 100) : 0}%
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="text-sm text-gray-500 mt-1">{task.description}</div>
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

                <td className="px-6 py-4">{formatRelativeDate(task.deadline)}</td>

                <td className="px-6 py-4">
                    <div className="flex gap-3">
                        <EditButton
                            onClick={() => onEditClick(task)}
                            ariaLabel={`Rediger opgave: ${task.title}`}
                        />
                        <button
                            className="text-red-600 hover:text-red-800 font-medium transition-colors"
                            onClick={() => onDeleteClick(task.task_id)}
                        >
                            Slet
                        </button>
                    </div>
                </td>
            </tr>

            {/* Subtasks Rows */}
            {hasSubtasks &&
                isExpanded &&
                subtasks.map((subtask, idx) => {
                    const isLast = idx === subtasks.length - 1;
                    const connector = isLast ? "└─" : "├─";

                    return (
                        <tr
                            key={subtask.task_id}
                            className="bg-cyan-50/40 border-b border-gray-200 hover:bg-cyan-50 transition-colors"
                        >
                            <td className="px-6 py-3">
                                <div className="pl-6 flex items-center gap-2">
                                    <span className="text-teal-600 font-bold font-mono leading-none">
                                        {connector}
                                    </span>

                                    <button
                                        type="button"
                                        className={`font-medium ${subtask.status === "DONE"
                                            ? "line-through text-gray-500"
                                            : "text-gray-900"
                                            } hover:underline`}
                                        onClick={() => onTaskClick(subtask.task_id)}
                                        style={{ background: "none", border: "none", padding: 0 }}
                                    >
                                        {subtask.title}
                                    </button>
                                </div>
                            </td>

                            <td className="px-6 py-3">
                                <Badge variant="priority" value={subtask.priority} />
                            </td>

                            <td className="px-6 py-3">
                                <Badge variant="status" value={subtask.status} />
                            </td>

                            <td className="px-6 py-3">
                                <TaskAssignedUsers
                                    assignments={taskAssignments[subtask.task_id] || []}
                                    loading={!taskAssignments[subtask.task_id]}
                                />
                            </td>

                            <td className="px-6 py-3">
                                {formatRelativeDate(subtask.deadline)}
                            </td>

                            <td className="px-6 py-3">
                                <div className="flex gap-2">
                                    <EditButton
                                        onClick={() => onEditClick(subtask)}
                                        ariaLabel={`Rediger delopgave: ${subtask.title}`}
                                    />
                                </div>
                            </td>
                        </tr>
                    );
                })}
        </Fragment>
    );
}
