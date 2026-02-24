"use client";

import { Task, TaskGoalType, TaskStatus, TaskUnit } from "@/types/task";
import { formatRelativeDate, getPriorityAccentColors, translateTaskUnit } from "@/helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import Badge from "../../common/label/badge";
import RecurringBadge from "../../common/label/recurringBadge";

interface UserTaskCardProps {
    task: Task;
    onClick: () => void;
}

export default function UserTaskCard({ task, onClick }: UserTaskCardProps) {
    const isCompleted = task.status === TaskStatus.DONE;
    const isRecurring = !!task.recurring_template_id;
    const progress = task.current_quantity ?? 0;
    const target = task.target_quantity ?? null;
    const unit = translateTaskUnit(task.unit);
    const hasProgress = task.current_quantity != null && task.goal_type === TaskGoalType.FIXED;

    const isPercent = task.unit === TaskUnit.NONE;
    const progressPct = target ? Math.min(Math.round((progress / target) * 100), 100) : null;

    const progressLabel = isPercent
        ? `${progressPct ?? 0}%`
        : target !== null
            ? `${progress} / ${target}${unit ? ` ${unit}` : ""}`
            : `${progress}${unit ? ` ${unit}` : ""}`;



    return (
        <button
            onClick={onClick}
            className={`w-full flex text-left border border-[#E8E6E1] rounded-lg overflow-hidden bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow duration-200 ease active:shadow-md ${isCompleted ? 'opacity-50' : ''}`}
            style={{ background: isCompleted ? '#FAFAF7' : '#FFFFFF' }}
        >
            {/* Priority left bar */}
            <div className={`w-1 shrink-0 ${getPriorityAccentColors(task.priority)}`} />

            {/* Card content */}
            <div className="flex-1 min-w-0 px-4 py-4 md:px-6 md:py-5">
                {/* Top row: title + date */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                        className={`h5 font-semibold tracking-tight ${isCompleted ? 'line-through text-[#9DA1B4]' : 'text-[#1B1D22]'}`}
                        style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em' }}
                    >
                        {task.title}
                    </h3>
                    <span
                        className="mono-xs whitespace-nowrap shrink-0 pt-0.5"
                    >
                        {task.scheduled_date
                            ? formatRelativeDate(task.scheduled_date)
                            : formatRelativeDate(task.deadline)}
                    </span>
                </div>

                {/* Description */}
                {task.description && (
                    <p className="body-xs line-clamp-2 mb-3">
                        {task.description}
                    </p>
                )}

                {/* Progress mini bar */}
                {hasProgress && progressPct !== null && (
                    <div className="h-[3px] rounded-full bg-[#E8E6E1] overflow-hidden mb-2">
                        <div
                            className="h-full rounded-full bg-[#0f6e56] transition-all"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                )}

                {/* Footer: badge + progress value */}
                <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Priority badge */}
                        <Badge
                            variant="priority"
                            value={task.priority}
                            size="sm"
                        />

                        {/* Recurring tag */}
                        {isRecurring && (
                            <RecurringBadge size="sm" />
                        )}

                        {/* Completed badge */}
                        {isCompleted && (
                            <span className="badge rounded-lg bg-[#E8F7F0] text-[#2D9F6F] px-2 py-0.5 flex items-center gap-1 uppercase tracking-[0.06em] font-bold">
                                <FontAwesomeIcon icon={faCheck} className="w-2 h-2" />
                                Færdig
                            </span>
                        )}
                    </div>

                    {/* Progress value */}
                    {hasProgress && (
                        <span
                            className="mono-xs-accent font-medium"
                        >
                            {progressLabel}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}