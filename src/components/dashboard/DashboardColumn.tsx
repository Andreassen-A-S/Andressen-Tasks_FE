import type { Task } from "@/types/task";
import type { Project } from "@/types/project";
import type { TaskAssignment } from "@/types/assignment";
import { colors } from "@/constants/colors";
import DashboardTaskCard from "./DashboardTaskCard";
import Pill from "@/components/common/label/Pill";
import { formatNumber } from "@/helpers/helpers";

export type ColumnVariant = "upcoming" | "active" | "overdue" | "done";

interface DashboardColumnProps {
    title: string;
    tasks: Task[];
    projectMap: Record<string, Project>;
    assignmentMap: Record<string, TaskAssignment[]>;
    variant: ColumnVariant;
    action?: React.ReactNode;
}

const variantDot: Record<ColumnVariant, string> = {
    upcoming: "border-gray-500 bg-gray-100",
    active: "border-blue-600 bg-blue-100",
    overdue: "border-red-600 bg-red-100",
    done: "border-green-700 bg-green-100",
};

export default function DashboardColumn({ title, tasks, projectMap, assignmentMap, variant, action }: DashboardColumnProps) {
    return (
        <div
            className="flex-1 flex flex-col min-w-0 rounded-t-lg border-t border-x overflow-hidden"
            style={{ backgroundColor: variant === "overdue" ? colors.redLight : colors.eggWhite, borderColor: variant === "overdue" ? colors.redBorder : colors.border }}
        >
            <div
                className="flex items-center gap-2 px-4 py-3 shrink-0"
                style={{ backgroundColor: variant === "overdue" ? colors.redLight : colors.eggWhite }}
            >
                <div className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 ${variantDot[variant]}`} />
                <span className="body-md !font-semibold">{title}</span>
                {action ?? <div className="h-7" />}
                <Pill size="md" color="gray">{formatNumber(tasks.length)}</Pill>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5" style={{ backgroundColor: variant === "overdue" ? colors.redLight : colors.eggWhite }}>
                {tasks.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                        <p className="body-sm !text-text-muted">Ingen opgaver</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <DashboardTaskCard
                            key={task.task_id}
                            task={task}
                            project={projectMap[task.project_id]}
                            assignments={assignmentMap[task.task_id] ?? []}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
