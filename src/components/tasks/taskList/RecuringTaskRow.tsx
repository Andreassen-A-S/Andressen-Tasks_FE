"use client";

import { Fragment, useState } from "react";
import { TaskGoalType, type Task } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";
import { formatRelativeDate, translateTaskUnit } from "@/helpers/helpers";
import Badge from "../../common/label/badge";
import TaskAssignedUsers from "../../common/label/taskAssignedUsers";
import EditButton from "../../common/label/editButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faRepeat, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import SubTaskRow from "./SubTaskRow";

interface RecurringTaskRowProps {
    task: Task;
    subtasks: Task[];
    taskAssignments: Record<string, TaskAssignment[]>;
    onTaskClick: (taskId: string) => void;
    onEditClick: (task: Task) => void;
    onDeleteClick: (taskId: string) => void;
}

export default function RecurringTaskRow({
    task,
    subtasks,
    taskAssignments,
    onTaskClick,
    onEditClick,
    onDeleteClick,
}: RecurringTaskRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const hasSubtasks = subtasks.length > 0;

    const progress = hasSubtasks
        ? {
            completed: subtasks.filter((st) => st.status === "DONE").length,
            total: subtasks.length,
        }
        : null;

    const hasQuantityProgress =
        !hasSubtasks &&
        (task.current_quantity != null || task.target_quantity != null) &&
        task.goal_type === TaskGoalType.FIXED;

    const progressUnit = translateTaskUnit(task.unit);

    // Format occurrence date
    const formattedOccurrence = task.occurrence_date
        ? new Date(task.occurrence_date).toLocaleDateString('da-DK', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
        : null;

    return (
        <Fragment>
            {/* Recurring Task Row */}
            <tr className="bg-gradient-to-r from-blue-50/50 to-transparent border-b border-blue-200 hover:from-blue-50 hover:to-blue-50/30 transition-all duration-200 border-l-4 border-l-blue-500">
                <td className="w-10 px-2 py-3 relative">
                    {hasSubtasks && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded((v) => !v)}
                            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                inline-flex items-center justify-center h-8 w-8 transition-transform duration-200
                                ${isExpanded ? "rotate-90 text-blue-400" : "text-blue-500"}`}
                            aria-label={isExpanded ? "Skjul delopgaver" : "Vis delopgaver"}
                            aria-expanded={isExpanded}
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    )}
                </td>

                {/* Title + Description */}
                <td className="py-4">
                    <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => onTaskClick(task.task_id)}
                                    className="text-left cursor-pointer min-w-0"
                                >
                                    <div className="text-base font-semibold text-gray-900 hover:underline wrap-break-word">
                                        {task.title}
                                    </div>
                                </button>

                                {/* Recurring badge */}
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full border border-blue-200">
                                    <FontAwesomeIcon icon={faRepeat} className="w-3 h-3" />
                                    Gentages
                                </span>

                                {/* Occurrence date badge */}
                                {formattedOccurrence && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 bg-white rounded-full border border-blue-200">
                                        <FontAwesomeIcon icon={faCalendarDays} className="w-3 h-3" />
                                        {formattedOccurrence}
                                    </span>
                                )}

                                {/* Subtask progress bar */}
                                {hasSubtasks && (
                                    <div className="flex items-center gap-2 min-w-30">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-blue-600 rounded text-xs font-bold">
                                            {progress?.completed}/{progress?.total}
                                        </span>

                                        <div className="relative w-24 h-2 bg-blue-100 rounded overflow-hidden">
                                            <div
                                                className="absolute left-0 top-0 h-2 bg-blue-500 transition-all"
                                                style={{
                                                    width: `${progress ? (progress.completed / progress.total) * 100 : 0}%`,
                                                }}
                                            />
                                            {progress && progress.total > 1 &&
                                                Array.from({ length: progress.total - 1 }).map((_, i) => (
                                                    <div
                                                        key={`${task.task_id}-divider-${i}`}
                                                        className="absolute top-0 bottom-0 w-0.5 bg-white"
                                                        style={{
                                                            left: `${((i + 1) / progress.total) * 100}%`,
                                                        }}
                                                    />
                                                ))}
                                        </div>

                                        <span className="text-xs font-semibold text-blue-600 ml-1">
                                            {progress ? Math.round((progress.completed / progress.total) * 100) : 0}%
                                        </span>
                                    </div>
                                )}

                                {/* Quantity progress bar (fixed goals) */}
                                {hasQuantityProgress && task.target_quantity != null && task.target_quantity > 0 && (
                                    <div className="flex items-center gap-2 min-w-30">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-blue-600 rounded text-xs font-bold">
                                            {task.current_quantity ?? 0}/{task.target_quantity}
                                            {progressUnit ? ` ${progressUnit}` : ""}
                                        </span>

                                        <div className="relative w-24 h-2 bg-blue-100 rounded overflow-hidden">
                                            <div
                                                className="absolute left-0 top-0 h-2 bg-blue-500 transition-all"
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        ((task.current_quantity ?? 0) / task.target_quantity) * 100
                                                    )}%`,
                                                }}
                                            />
                                        </div>

                                        <span className="text-xs font-semibold text-blue-600 ml-1">
                                            {Math.round(
                                                Math.min(1, (task.current_quantity ?? 0) / task.target_quantity) * 100
                                            )}
                                            %
                                        </span>
                                    </div>
                                )}
                            </div>

                            {task.description && (
                                <div className="text-sm text-gray-600 mt-1 break-words">
                                    {task.description.split(" ").length > 20
                                        ? `${task.description.split(" ").slice(0, 20).join(" ")}...`
                                        : task.description}
                                </div>
                            )}
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

                <td className="px-6 py-4 text-sm text-gray-600">
                    {formatRelativeDate(task.scheduled_date)}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                    {formatRelativeDate(task.deadline)}
                </td>

                <td className="px-6 py-4">
                    <div className="flex gap-3">
                        <EditButton
                            onClick={() => onEditClick(task)}
                            ariaLabel={`Rediger opgave: ${task.title}`}
                        />
                        <button
                            className="text-red-600 hover:text-red-800 font-medium transition-colors text-sm"
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
                    const isFirst = idx === 0;
                    const isLast = idx === subtasks.length - 1;
                    return (
                        <SubTaskRow
                            key={subtask.task_id}
                            subtask={subtask}
                            isFirst={isFirst}
                            isLast={isLast}
                            taskAssignments={taskAssignments}
                            onTaskClick={onTaskClick}
                            onEditClick={onEditClick}
                        />
                    );
                })}
        </Fragment>
    );
}