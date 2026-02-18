import { Task, TaskGoalType } from "@/types/task";
import Badge from "@/components/common/label/badge";
import { formatLocalDate, getPriorityAccentColors, translateTaskUnit } from "@/helpers/helpers";
import RecurrenceBadge from "@/components/common/label/recurringBadge";

interface CalendarTaskCardProps {
    task: Task;
    onClick: () => void;
}

export default function CalendarTaskCard({ task, onClick }: CalendarTaskCardProps) {
    return (
        <div className="bg-white border border-[#E8E6E1] rounded-lg flex overflow-hidden"
            onClick={onClick}>
            <div className={`w-1 flex-shrink-0 ${getPriorityAccentColors(task.priority)}`} />
            <div className="flex-1 px-2.5 py-2.5">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="h5">
                        {task.title}

                    </span>
                    <Badge variant="priority" value={task.priority} />
                </div>
                <div className="mono-xs">
                    {`Deadline: ${formatLocalDate(task.deadline)}`}
                    {task.current_quantity != null && task.goal_type === TaskGoalType.FIXED && (
                        <span className="text-[#0f6e56] ml-2">
                            {task.current_quantity}/{task.target_quantity} {translateTaskUnit(task.unit)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}