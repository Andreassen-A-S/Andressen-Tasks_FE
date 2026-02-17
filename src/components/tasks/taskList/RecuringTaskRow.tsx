"use client";

import { Fragment, useState } from "react";
import { TaskGoalType, type Task } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";
import { formatRelativeDate, translateTaskUnit } from "@/helpers/helpers";
import Badge from "../../common/label/badge";
import TaskAssignedUsers from "../../common/label/taskAssignedUsers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faRepeat } from "@fortawesome/free-solid-svg-icons";
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

    return (
        <Fragment>
            {/* Recurring Task Row */}
            <tr className=" bg-white border-b border-[#E8E6E1] hover:bg-[#FAFAF7] transition-all duration-200">
                <td className="w-10 px-2 py-3 relative">
                    {hasSubtasks && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded((v) => !v)}
                            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                inline-flex items-center justify-center h-8 w-8 transition-transform duration-200 rounded-lg bg-[#EBF0FD]
                                ${isExpanded ? "rotate-90 text-[#2C5FE0]" : "text-[#2C5FE0]"}`}
                            aria-label={isExpanded ? "Skjul delopgaver" : "Vis delopgaver"}
                            aria-expanded={isExpanded}
                        >
                            <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
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
                                    <div className="h5 wrap-break-word max-w-md hover:underline">
                                        {task.title}
                                    </div>
                                </button>

                                {/* Recurring badge */}
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 badge bg-[#EBF0FD] text-[#2C5FE0] rounded-lg">
                                    <FontAwesomeIcon icon={faRepeat} className="w-3 h-3" />
                                    Gentages
                                </span>

                                {/* Subtask progress bar */}
                                {hasSubtasks && (
                                    <div className="flex items-center gap-2 min-w-30">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#EBF0FD] text-[#2C5FE0] badge">
                                            {progress?.completed}/{progress?.total}
                                        </span>

                                        <div className="relative w-24 h-2 bg-[#EBF0FD] rounded-lg overflow-hidden">
                                            <div
                                                className="absolute left-0 top-0 h-2 bg-[#2C5FE0] transition-all rounded-lg"
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

                                        <span className="body-xs ml-1">
                                            {progress ? Math.round((progress.completed / progress.total) * 100) : 0}%
                                        </span>
                                    </div>
                                )}

                                {/* Quantity progress bar (fixed goals) */}
                                {hasQuantityProgress && task.target_quantity != null && task.target_quantity > 0 && (
                                    <div className="flex items-center gap-2 min-w-30">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#E8F7F0] text-[#2D9F6F] badge">
                                            {task.current_quantity ?? 0}/{task.target_quantity}
                                            {progressUnit ? ` ${progressUnit}` : ""}
                                        </span>

                                        <div className="relative w-24 h-2 bg-[#E8F7F0] rounded-lg overflow-hidden">
                                            <div
                                                className="absolute left-0 top-0 h-2 bg-[#2D9F6F] transition-all rounded-lg"
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        ((task.current_quantity ?? 0) / task.target_quantity) * 100
                                                    )}%`,
                                                }}
                                            />
                                        </div>

                                        <span className="body-xs ml-1">
                                            {Math.round(
                                                Math.min(1, (task.current_quantity ?? 0) / task.target_quantity) * 100
                                            )}
                                            %
                                        </span>
                                    </div>
                                )}
                            </div>

                            {task.description && (
                                <div className="body-xs mt-1 break-words">
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

                <td className="px-6 py-4 body-xs">
                    {formatRelativeDate(task.scheduled_date)}
                </td>

                <td className="px-6 py-4 body-xs">
                    {formatRelativeDate(task.deadline)}
                </td>

                <td className="px-6 py-4">
                    <div className="flex gap-3">
                        <button
                            className="link"
                            onClick={() => onEditClick(task)}
                        >
                            Rediger
                        </button>
                        <button
                            className="link-danger"
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