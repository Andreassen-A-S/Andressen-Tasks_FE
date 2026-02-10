import Badge from "@/components/label/badge";
import TaskAssignedUsers from "@/components/label/taskAssignedUsers";
import EditButton from "@/components/label/editButton";
import { formatRelativeDate } from "@/helpers/helpers";
import type { Task } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";

const lineX = 19;
const dotX = 50;
const lineThickness = 2;
const dotSize = 10;
const dotRadius = dotSize / 2;
const lineToDotEdge = dotX - dotRadius - lineX;

interface SubTaskRowProps {
    subtask: Task;
    isFirst: boolean;
    isLast: boolean;
    taskAssignments: Record<string, TaskAssignment[]>;
    onTaskClick: (taskId: string) => void;
    onEditClick: (task: Task) => void;
}

export default function SubTaskRow({
    subtask,
    isFirst,
    isLast,
    taskAssignments,
    onTaskClick,
    onEditClick,
}: SubTaskRowProps) {
    return (
        <tr className="bg-gray-50/50 hover:bg-gray-100/50 transition-colors order-b border-gray-200">
            {/* First column - Tree lines */}
            <td className="pl-4 pr-2 py-3 relative">
                {/* lines ABOVE the border */}
                <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none" style={{ width: "50px" }}>
                    <div
                        className="absolute bg-gray-300"
                        style={{
                            left: `${lineX}px`,
                            top: isFirst ? "-38px" : 0,
                            width: `${lineThickness}px`,
                            height: isFirst ? "calc(50% + 38px)" : "50%",
                        }}
                    />
                    {!isLast && (
                        <div
                            className="absolute bg-gray-300"
                            style={{
                                left: `${lineX}px`,
                                top: "51%",
                                width: `${lineThickness}px`,
                                height: "50%",

                            }}
                        />
                    )}
                    <div
                        className="absolute bg-gray-300"
                        style={{
                            left: `${lineX}px`,
                            top: "50%",
                            width: `${lineToDotEdge}px`,
                            height: `${lineThickness}px`,
                            transform: "translateY(-50%)",

                        }}
                    />
                    <div
                        className="absolute rounded-full bg-gray-500"
                        style={{
                            width: `${dotSize}px`,
                            height: `${dotSize}px`,
                            left: `${dotX}px`,
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    />
                </div>
            </td>

            {/* Put the border on each cell instead of the tr */}
            <td className="px-6 py-3 border-b border-gray-200">
                <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                        <button
                            type="button"
                            className={`font-medium text-sm ${subtask.status === "DONE" ? "line-through text-gray-500" : "text-gray-900"
                                } hover:underline text-left`}
                            onClick={() => onTaskClick(subtask.task_id)}
                            style={{ background: "none", border: "none", padding: 0 }}
                        >
                            {subtask.title}
                        </button>

                        {subtask.description && (
                            <div className="text-sm text-gray-500 mt-1">{subtask.description}</div>
                        )}
                    </div>
                </div>
            </td>

            <td className="px-6 py-3 border-b border-gray-200">
                <Badge variant="priority" value={subtask.priority} />
            </td>

            <td className="px-6 py-3 border-b border-gray-200">
                <Badge variant="status" value={subtask.status} />
            </td>

            <td className="px-6 py-3 border-b border-gray-200">
                <TaskAssignedUsers
                    assignments={taskAssignments[subtask.task_id] || []}
                    loading={!taskAssignments[subtask.task_id]}
                />
            </td>

            <td className="px-6 py-3 text-sm text-gray-600 border-b border-gray-200">
                {formatRelativeDate(subtask.scheduled_date)}
            </td>

            <td className="px-6 py-3 text-sm text-gray-600 border-b border-gray-200">
                {formatRelativeDate(subtask.deadline)}
            </td>

            <td className="px-6 py-3 border-b border-gray-200">
                <div className="flex gap-2">
                    <EditButton onClick={() => onEditClick(subtask)} ariaLabel={`Rediger delopgave: ${subtask.title}`} />
                </div>
            </td>
        </tr>
    );
}