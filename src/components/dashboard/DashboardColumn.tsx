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

const variantAccent: Record<ColumnVariant, string> = {
    upcoming: colors.textMuted,
    active: colors.green,
    overdue: colors.yellow,
    done: colors.greenMid,
};

export default function DashboardColumn({ title, tasks, projectMap, assignmentMap, variant, action }: DashboardColumnProps) {
    const accent = variantAccent[variant];

    return (
        <div
            className="flex-1 flex flex-col min-w-0 border-r last:border-r-0"
            style={{ borderColor: colors.border }}
        >
            <div
                className="flex items-center gap-2.5 px-4 py-3 border-b flex-shrink-0"
                style={{ borderColor: colors.border, backgroundColor: colors.white }}
            >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                <span className="label-md" style={{ color: colors.textPrimary }}>{title}</span>
                {action ?? <div className="h-7" />}
                <Pill size="sm" className="ml-auto">{formatNumber(tasks.length)}</Pill>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5" style={{ backgroundColor: variant === "overdue" ? colors.yellowLight : colors.eggWhite }}>
                {tasks.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                        <p className="body-sm" style={{ color: colors.textMuted }}>Ingen opgaver</p>
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
