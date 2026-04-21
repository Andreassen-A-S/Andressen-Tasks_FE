import Badge from "@/components/common/label/badge";
import TaskAssignedUsers from "@/components/common/label/taskAssignedUsers";
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
}

export default function SubTaskRow({
    subtask,
    isFirst,
    isLast,
    taskAssignments,
    onTaskClick,
}: SubTaskRowProps) {
    return (
        <tr className="bg-[#FAFAF7] hover:bg-[#F6F5F1] transition-colors border-b border-[#E8E6E1]">
            {/* Tree lines column */}
            <td className="pl-4 pr-2 py-3 relative">
                <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none" style={{ width: "50px" }}>
                    <div
                        className="absolute bg-[#E8E6E1]"
                        style={{
                            left: `${lineX}px`,
                            top: isFirst ? "-30px" : 0,
                            width: `${lineThickness}px`,
                            height: isFirst ? "calc(50% + 38px)" : "50%",
                        }}
                    />
                    {!isLast && (
                        <div
                            className="absolute bg-[#E8E6E1]"
                            style={{
                                left: `${lineX}px`,
                                top: "51%",
                                width: `${lineThickness}px`,
                                height: "50%",
                            }}
                        />
                    )}
                    <div
                        className="absolute bg-[#E8E6E1]"
                        style={{
                            left: `${lineX}px`,
                            top: "50%",
                            width: `${lineToDotEdge}px`,
                            height: `${lineThickness}px`,
                            transform: "translateY(-50%)",
                        }}
                    />
                    <div
                        className="absolute rounded-full bg-[#A8AABB]"
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

            {/* Title & description */}
            <td className="px-6 py-3 border-b border-[#E8E6E1]">
                <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                        <button
                            type="button"
                            className={`h5 text-left ${subtask.status === "DONE" ? "line-through body-xs" : ""} hover:underline`}
                            onClick={() => onTaskClick(subtask.task_id)}
                            style={{ background: "none", border: "none", padding: 0 }}
                        >
                            {subtask.title}
                        </button>
                        {subtask.description && (
                            <div className="body-xs mt-1">{subtask.description}</div>
                        )}
                    </div>
                </div>
            </td>

            <td className="px-6 py-3 border-b border-[#E8E6E1]">
                <Badge variant="priority" value={subtask.priority} />
            </td>

            <td className="px-6 py-3 border-b border-[#E8E6E1]">
                <Badge variant="status" value={subtask.status} />
            </td>

            <td className="px-6 py-3 border-b border-[#E8E6E1]">
                <TaskAssignedUsers
                    assignments={taskAssignments[subtask.task_id] || []}
                    loading={!taskAssignments[subtask.task_id]}
                />
            </td>

            <td className="px-6 py-3 body-xs border-b border-[#E8E6E1]">
                {formatRelativeDate(subtask.start_date)}
            </td>

            <td className="px-6 py-3 body-xs border-b border-[#E8E6E1]">
                {formatRelativeDate(subtask.deadline)}
            </td>
        </tr>
    );
}
