import type { Task } from "@/types/task";
import type { Project } from "@/types/project";
import type { TaskAssignment } from "@/types/assignment";
import { colors } from "@/constants/colors";
import Badge from "@/components/common/label/Badge";
import ProjectBadge from "@/components/common/label/ProjectBadge";
import DeadlineBadge from "@/components/common/label/DeadlineBadge";
import TaskAssignedUsers from "@/components/common/label/TaskAssignedUsers";

interface DashboardTaskCardProps {
    task: Task;
    project?: Project;
    assignments: TaskAssignment[];
}

export default function DashboardTaskCard({ task, project, assignments }: DashboardTaskCardProps) {
    return (
        <div
            className="rounded-md border px-4 py-3 flex flex-col gap-2 transition-colors"
            style={{ backgroundColor: colors.white, borderColor: colors.border }}
        >
            <div className="flex items-start justify-between gap-3">
                <p className="label-lg leading-snug min-w-0" style={{ color: colors.textPrimary }}>
                    {task.title}
                </p>
                <Badge variant="priority" value={task.priority} size="sm" />
            </div>

            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    {project && <ProjectBadge name={project.name} size="sm" />}
                    <DeadlineBadge deadline={task.deadline} size="sm" />
                </div>
                <TaskAssignedUsers users={assignments.map((a) => ({ id: a.assignment_id, name: a.user.name, position: a.user.position }))} size="sm" />
            </div>
        </div>
    );
}
