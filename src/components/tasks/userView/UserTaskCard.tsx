"use client";

import { Task } from "@/types/task";
import { formatRelativeDate, translatePriority, translateTaskUnit } from "@/helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

interface UserTaskCardProps {
    task: Task;
    onClick: () => void;
}

export default function UserTaskCard({ task, onClick }: UserTaskCardProps) {
    const isCompleted = task.status === 'DONE';
    const progress = task.current_quantity ?? 0;
    const target = task.target_quantity ?? null;
    const unit = translateTaskUnit(task.unit);
    const progressLabel = target !== null
        ? `${progress}/${target}${unit ? ` ${unit}` : ""}`
        : `${progress}${unit ? ` ${unit}` : ""}`;

    // Get left border color based on priority
    const getLeftBorderColor = () => {
        switch (task.priority) {
            case 'HIGH':
                return '#ef4444'; // red-500
            case 'MEDIUM':
                return '#fb923c'; // orange-400
            case 'LOW':
                return '#facc15'; // yellow-400
            default:
                return '#d1d5db'; // gray-300
        }
    };

    const getPriorityTextClass = () => {
        switch (task.priority) {
            case 'HIGH':
                return 'text-red-600';
            case 'MEDIUM':
                return 'text-orange-600';
            case 'LOW':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <button
            onClick={onClick}
            className={`w-full bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 hover:shadow-lg hover:border-gray-300 transition-all text-left ${isCompleted ? 'opacity-60 bg-gray-50' : ''
                }`}
            style={{
                borderLeft: `4px solid ${getLeftBorderColor()}`
            }}
        >
            {/* Header: Priority and Time */}
            <div className="flex items-center justify-between mb-3">
                <div className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wide ${getPriorityTextClass()}`}>
                    {translatePriority(task.priority)} prioritet
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 bg-gray-100 px-2.5 sm:px-3 py-1 rounded-lg font-medium">
                    {task.scheduled_date ? `Planlagt ${formatRelativeDate(task.scheduled_date)}` : formatRelativeDate(task.deadline)}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div
                    className={`w-6 h-6 flex-shrink-0 mt-0.5 border-2 rounded-lg transition-all ${isCompleted
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isCompleted && (
                        <FontAwesomeIcon
                            icon={faCheck}
                            className="text-white w-full h-full p-1"
                        />
                    )}
                </div>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                    <h3 className={`text-base sm:text-lg font-semibold mb-1.5 tracking-tight ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                        {task.title}
                    </h3>
                    {task.description && (
                        <p className={`text-sm sm:text-base leading-relaxed line-clamp-2 ${isCompleted ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {task.description}
                        </p>
                    )}
                    {(task.current_quantity != null || task.target_quantity != null) && (
                        <p className="mt-2 text-xs sm:text-sm font-medium text-teal-700">
                            Fremskridt: {progressLabel}
                        </p>
                    )}
                </div>

                {/* Menu Dots */}
                <div
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <FontAwesomeIcon
                        icon={faEllipsisVertical}
                        className="text-gray-400 text-sm"
                    />
                </div>
            </div>
        </button>
    );
}
