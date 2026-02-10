import Badge from "../label/badge";
import TaskAssignedUsers from "../label/taskAssignedUsers";
import EditButton from "../label/editButton";
import { formatRelativeDate } from "@/helpers/helpers";
import type { Task } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-regular-svg-icons";

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
        <tr className="bg-gray-50/50 border-b border-gray-200 hover:bg-gray-100/50 transition-colors relative">
            {/* Tree line visualization - positioned absolutely */}
            <td className="px-2 py-3 relative">
                {/* Empty cell for expand arrow column */}
            </td>

            <td className="px-2 py-3 relative">
                <div className="pl-8 flex items-start gap-2 relative">
                    {/* Tree connector lines */}
                    {/* <div
                        className="absolute left-0 pointer-events-none"
                        style={{ top: 0, bottom: 0, width: '32px' }}
                    > */}
                    {/* Vertical line connecting to previous/next subtasks */}
                    {/* {!isFirst && (
                            <div
                                className="absolute bg-gray-300"
                                style={{
                                    left: '19px',
                                    top: 0,
                                    width: '1px',
                                    height: '50%'
                                }}
                            />
                        )} */}

                    {/* Vertical line to next subtask */}
                    {/* {!isLast && (
                            <div
                                className="absolute bg-gray-300"
                                style={{
                                    left: '19px',
                                    top: '50%',
                                    width: '1px',
                                    height: '50%'
                                }}
                            />
                        )} */}

                    {/* Horizontal connector to icon */}
                    {/* <div
                            className="absolute bg-gray-300"
                            style={{
                                left: '19px',
                                top: '50%',
                                width: '16px',
                                height: '1px'
                            }}
                        /> */}
                    {/* </div> */}

                    {/* Subtask icon
                    <div className="flex-shrink-0 relative z-10">
                        <FontAwesomeIcon
                            icon={faClipboard}
                            className="text-gray-400 text-sm"
                        />
                    </div> */}

                    {/* Subtask title */}
                    <button
                        type="button"
                        className={`font-medium text-sm ${subtask.status === "DONE"
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                            } hover:underline text-left`}
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

            <td className="px-6 py-3 text-sm text-gray-600">
                {formatRelativeDate(subtask.scheduled_date)}
            </td>

            <td className="px-6 py-3 text-sm text-gray-600">
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
}