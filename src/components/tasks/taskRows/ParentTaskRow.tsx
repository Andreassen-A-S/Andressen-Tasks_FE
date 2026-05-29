"use client";

import { Fragment, useState } from "react";
import { type Task } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";
import { formatCommentDate, formatRelativeDate, translateTaskUnit, formatNumber } from "@/helpers/helpers";
import { colors } from "@/constants/colors";
import Badge from "../../common/label/Badge";
import TaskAssignedUsers from "../../common/label/TaskAssignedUsers";
import { Target, ChevronRight, ListChecks, Repeat } from "lucide-react";
import SubTaskRow from "./SubTaskRow";

interface ParentTaskRowProps {
    task: Task;
    subtasks: Task[];
    taskAssignments: Record<string, TaskAssignment[]>;
    onTaskClick: (taskId: string) => void;
}

function Dot() {
    return <span aria-hidden="true" style={{ color: colors.textMuted }}>•</span>;
}

export default function ParentTaskRow({
    task,
    subtasks,
    taskAssignments,
    onTaskClick,
}: ParentTaskRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const isRecurring = !!task.recurring_template_id;

    const hasSubtasks = subtasks.length > 0;

    const progress = hasSubtasks
        ? {
            completed: subtasks.filter((st) => st.status === "DONE").length,
            total: subtasks.length,
        }
        : null;

    const hasQuantityProgress = !hasSubtasks && task.goal != null;

    const progressUnit = translateTaskUnit(task.goal?.unit);
    const quantitySummary = task.goal != null
        ? `${formatNumber(task.goal.current_quantity)}/${formatNumber(task.goal.target_quantity)}${progressUnit ? ` ${progressUnit}` : ""}`
        : null;
    const updatedLabel = formatCommentDate(task.updated_at);
    const hasDetailSegment = hasSubtasks || hasQuantityProgress;

    return (
        <Fragment>
            {/* Task Row */}
            <tr
                className="bg-surface transition-colors"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.whiteHover; setIsHovered(true); }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.white; setIsHovered(false); }}
            >
                <td className="w-10 align-top relative">
                    {hasSubtasks && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded((v) => !v)}
                            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        inline-flex items-center justify-center h-8 w-8 transition-transform duration-200 rounded-lg
        ${isExpanded ? "rotate-90 text-border" : "text-text-muted"}`}
                            aria-label={isExpanded ? "Skjul delopgaver" : "Vis delopgaver"}
                            aria-expanded={isExpanded}
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </td>

                {/* Title */}
                <td className="py-3 align-top">
                    <div className="min-w-0">
                        <button
                            type="button"
                            onClick={() => onTaskClick(task.task_id)}
                            className="text-left cursor-pointer min-w-0"
                        >
                            <div className="h5 wrap-break-word hover:underline">
                                {task.title}
                            </div>
                        </button>

                        <div className={`flex items-center gap-2 body-xs flex-wrap ${isRecurring ? "mt-1" : "mt-0.5"}`} style={{ color: colors.textMuted }}>
                            {task.number > 0 && (
                                <>
                                    <span>{task.project?.name ? `${task.project.name} #${task.number}` : `#${task.number}`}</span>
                                    <Dot />
                                </>
                            )}
                            {isRecurring && (
                                <span className="flex items-center gap-1">
                                    <Repeat className="w-3 h-3" />
                                    Gentages
                                </span>
                            )}

                            {isRecurring && hasDetailSegment && <Dot />}

                            {hasSubtasks && progress && (
                                <span className="flex items-center gap-1">
                                    <ListChecks className="w-3 h-3" />
                                    {progress.completed}/{progress.total}
                                </span>
                            )}

                            {!hasSubtasks && hasQuantityProgress && quantitySummary && (
                                <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {quantitySummary}
                                </span>
                            )}

                            {(isRecurring || hasDetailSegment) && <Dot />}

                            <span>Opdateret {updatedLabel}</span>
                        </div>
                    </div>
                </td>

                <td className="px-6 py-3 align-middle">
                    <Badge variant="priority" value={task.priority} />
                </td>

                <td className="px-6 py-3 align-middle">
                    <Badge variant="status" value={task.status} />
                </td>

                <td className="px-6 py-3 align-middle">
                    <TaskAssignedUsers
                        size="sm"
                        users={(taskAssignments[task.task_id] || []).map((a) => ({ id: a.assignment_id, name: a.user.name, position: a.user.position?.name, profile_picture_url: a.user.profile_picture_url }))}
                        loading={!taskAssignments[task.task_id]}
                        ringColor={isHovered ? "ring-surface-hover" : "ring-surface"}
                    />
                </td>

                <td className="px-6 py-3 body-xs align-middle">
                    {formatRelativeDate(task.start_date)}
                </td>

                <td className="px-6 py-3 body-xs align-middle">
                    {formatRelativeDate(task.deadline)}
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
                        />
                    );
                })}
        </Fragment>
    );
}
