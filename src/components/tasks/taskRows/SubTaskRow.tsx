import Badge from "@/components/common/label/Badge";
import TaskAssignedUsers from "@/components/common/label/TaskAssignedUsers";
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
        <tr className="bg-surface-hover hover:bg-surface-subtle transition-colors">
            {/* Tree lines column */}
            <td className="pl-4 pr-2 py-3 align-top relative">
                <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none" style={{ width: "50px" }}>
                    <div
                        className="absolute bg-border"
                        style={{
                            left: `${lineX}px`,
                            top: isFirst ? "-30px" : 0,
                            width: `${lineThickness}px`,
                            height: isFirst ? "calc(50% + 38px)" : "50%",
                        }}
                    />
                    {!isLast && (
                        <div
                            className="absolute bg-border"
                            style={{
                                left: `${lineX}px`,
                                top: "51%",
                                width: `${lineThickness}px`,
                                height: "50%",
                            }}
                        />
                    )}
                    <div
                        className="absolute bg-border"
                        style={{
                            left: `${lineX}px`,
                            top: "50%",
                            width: `${lineToDotEdge}px`,
                            height: `${lineThickness}px`,
                            transform: "translateY(-50%)",
                        }}
                    />
                    <div
                        className="absolute rounded-full bg-nav-inactive"
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

            <td className="px-6 py-3 align-top">
                <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                        <button
                            type="button"
                            className={`h5 text-left hover:underline ${subtask.status === "DONE" ? "line-through" : ""}`}
                            onClick={() => onTaskClick(subtask.task_id)}
                            style={{ background: "none", border: "none", padding: 0 }}
                        >
                            {subtask.title}
                        </button>
                    </div>
                </div>
            </td>

            <td className="px-6 py-3 align-middle">
                <Badge variant="priority" value={subtask.priority} />
            </td>

            <td className="px-6 py-3 align-middle">
                <Badge variant="status" value={subtask.status} />
            </td>

            <td className="px-6 py-3 align-middle">
                <TaskAssignedUsers
                    users={(taskAssignments[subtask.task_id] || []).map((a) => ({ id: a.assignment_id, name: a.user.name, position: a.user.position?.name }))}
                    loading={!taskAssignments[subtask.task_id]}
                />
            </td>

            <td className="px-6 py-3 body-xs align-middle">
                {formatRelativeDate(subtask.start_date)}
            </td>

            <td className="px-6 py-3 body-xs align-middle">
                {formatRelativeDate(subtask.deadline)}
            </td>
        </tr>
    );
}
