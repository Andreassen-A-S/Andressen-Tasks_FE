import { colors } from "@/constants/colors";
import type { ProjectStats } from "@/types/stats";
import DataTable from "@/components/common/table/DataTable";

interface ProjectProblemTableProps {
    data?: ProjectStats[];
    periodLabel: string;
}

const columns = [
    { key: "project", header: "Projekt", className: "px-5 py-2.5 label-sm min-w-[260px]" },
    { key: "onTime", header: "Til tiden", className: "px-4 py-2.5 label-sm text-right" },
    { key: "completed", header: "Afsluttet", className: "px-4 py-2.5 label-sm text-right" },
    { key: "active", header: "Aktive", className: "px-4 py-2.5 label-sm text-right" },
    { key: "late", header: "For sent", className: "px-4 py-2.5 label-sm text-right" },
    { key: "overdue", header: "Overskredne", className: "px-5 py-2.5 label-sm text-right" },
];

export default function ProjectProblemTable({ data, periodLabel }: ProjectProblemTableProps) {
    const projects = data ?? [];
    const totalOverdue = projects.reduce((sum, project) => sum + project.overdue_active_tasks, 0);
    const totalLate = projects.reduce((sum, project) => sum + project.late_completed_count, 0);

    if (!projects.length) {
        return (
            <div className="rounded-lg border p-5" style={{ borderColor: colors.border, backgroundColor: colors.white }}>
                <h3 className="h4">Projekter</h3>
                <p className="body-md text-center py-8" style={{ color: colors.textMuted }}>
                    Ingen projektdata for {periodLabel.toLowerCase()}
                </p>
            </div>
        );
    }

    return (
        <DataTable
            columns={columns}
            toolbar={
                <>
                    <div>
                        <h3 className="h4">Projektoversigt</h3>
                        <p className="body-sm" style={{ color: colors.textMuted }}>
                            KPI&apos;er pr. projekt for {periodLabel.toLowerCase()}.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 label-md" style={{ color: colors.textSecondary }}>
                        <span><strong style={{ color: colors.textPrimary }}>{projects.length}</strong> projekter</span>
                        <span><strong style={{ color: totalOverdue ? colors.red : colors.textPrimary }}>{totalOverdue}</strong> overskredne</span>
                        <span><strong style={{ color: totalLate ? colors.yellow : colors.textPrimary }}>{totalLate}</strong> for sent</span>
                    </div>
                </>
            }
        >
            {projects.map(project => {
                const projectColor = project.color ?? colors.textMuted;
                const hasOverdue = project.overdue_active_tasks > 0;
                const hasLate = project.late_completed_count > 0;

                return (
                    <tr key={project.project_id}>
                        <td className="px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <span
                                    className="h-3 w-3 flex-shrink-0 rounded-full"
                                    style={{ backgroundColor: projectColor }}
                                />
                                <p className="label-lg truncate" style={{ color: colors.textPrimary }}>{project.name}</p>
                            </div>
                        </td>
                        <td className="px-4 py-4 text-right label-md" style={{ color: project.on_time_rate >= 80 ? colors.green : project.on_time_rate > 0 ? colors.yellow : colors.red }}>
                            {project.on_time_rate}%
                        </td>
                        <td className="px-4 py-4 text-right label-md" style={{ color: colors.textPrimary }}>
                            {project.completed_count}
                        </td>
                        <td className="px-4 py-4 text-right label-md" style={{ color: colors.textPrimary }}>
                            {project.active_tasks}
                        </td>
                        <td className="px-4 py-4 text-right label-md" style={{ color: hasLate ? colors.yellow : colors.textSecondary }}>
                            {project.late_completed_count}
                        </td>
                        <td className="px-5 py-4 text-right label-md" style={{ color: hasOverdue ? colors.red : colors.textSecondary }}>
                            {project.overdue_active_tasks}
                        </td>
                    </tr>
                );
            })}
        </DataTable>
    );
}
