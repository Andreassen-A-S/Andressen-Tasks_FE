import type { Task } from "@/types/task";
import type { Project } from "@/types/project";
import type { TaskAssignment } from "@/types/assignment";
import { CircleCheck, CircleDot } from "lucide-react";
import { colors } from "@/constants/colors";
import { TaskStatus } from "@/types/task";
import Badge from "@/components/common/label/Badge";
import DeadlineBadge from "@/components/common/label/DeadlineBadge";
import TaskAssignedUsers from "@/components/common/label/TaskAssignedUsers";
import Link from "next/link";

const CLOSED_STATUSES = new Set([TaskStatus.DONE, TaskStatus.REJECTED, TaskStatus.ARCHIVED]);

const statusIconColor: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: "text-blue-600",
    [TaskStatus.IN_PROGRESS]: "text-blue-600",
    [TaskStatus.DONE]: "text-green-700",
    [TaskStatus.REJECTED]: "text-green-700",
    [TaskStatus.ARCHIVED]: "text-green-700",
};

interface DashboardTaskCardProps {
    task: Task;
    project?: Project;
    assignments: TaskAssignment[];
}

export default function DashboardTaskCard({ task, project, assignments }: DashboardTaskCardProps) {
    return (
        <Link
            href={`/tasks/${task.task_id}`}
            className="rounded-md border px-3 py-2.5 flex gap-2 transition-colors hover:no-underline"
            style={{ backgroundColor: colors.white, borderColor: colors.border }}
        >
            <div className="flex flex-col gap-2 min-w-0 flex-1">
                <div className="flex items-center gap-1 min-w-0">
                    {CLOSED_STATUSES.has(task.status)
                        ? <CircleCheck className={`w-4.5 h-4.5 shrink-0 ${statusIconColor[task.status]}`} />
                        : <CircleDot className={`w-4.5 h-4.5 shrink-0 ${statusIconColor[task.status]}`} />
                    }
                    {project && (
                        <span className="body-xs text-text-secondary! truncate">{project.name}</span>
                    )}
                    {task.number > 0 && (
                        <span className="body-xs text-text-secondary! shrink-0">#{task.number}</span>
                    )}
                </div>

                <p className="body-sm text-text-primary! my-0">
                    {task.title}
                </p>

                <div className="flex items-center gap-1">
                    <Badge variant="priority" value={task.priority} size="sm" />
                    <DeadlineBadge deadline={task.deadline} size="sm" bordered />
                </div>
            </div>

            <TaskAssignedUsers
                users={assignments.map((a) => ({ id: a.assignment_id, name: a.user.name, position: a.user.position?.name, profile_picture_url: a.user.profile_picture_url }))}
                size="sm"
                className="self-start"
            />
        </Link>
    );
}
