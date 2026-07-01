"use client";

import { SquarePen, Settings, Trash2, Repeat, ClipboardList, } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import DropdownMenu from "@/components/common/DropdownMenu";
import { formatCommentDate, formatNumber } from "@/helpers/helpers";
import ProjectActivityBar from "./ProjectActivityBar";
import { colors } from "@/constants/colors";

interface ProjectRowProps {
    project: Project;
    taskCount: number;
    templateCount: number;
    tasks: Task[];
    onEdit: () => void;
    onDelete: () => void;
}

const Dot = () => <span style={{ color: colors.textMuted }}>•</span>;

export default function ProjectRow({ project, taskCount, templateCount, tasks, onEdit, onDelete }: ProjectRowProps) {
    const color = project.color ?? colors.border;

    const lastActivityDate = tasks.length > 0
        ? new Date(Math.max(...tasks.map((t) => new Date(t.updated_at).getTime()))).toISOString()
        : project.updated_at;

    const updatedAt = formatCommentDate(lastActivityDate);

    return (
        <tr className="transition-colors" style={{ backgroundColor: colors.white }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.whiteHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.white)}
        >
            {/* Main content */}
            <td className="py-3.5 px-4 w-full">
                {/* Line 1: name */}
                <Link
                    href={`/tasks?project=${project.project_id}`}
                    className="block label-lg mb-1 hover:underline"
                    style={{ color: colors.textPrimary }}
                >
                    {project.name}
                </Link>

                {/* Line 2: description */}
                {project.description && (
                    <p className="body-xs mb-2 line-clamp-1" style={{ color: colors.textSecondary }}>{project.description}</p>
                )}

                {/* Line 3: metadata strip */}
                <div className="flex items-center gap-2 body-xs flex-wrap" style={{ color: colors.textMuted }}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />

                    <Dot />

                    <Link
                        href={`/tasks?project=${project.project_id}`}
                        className="flex items-center gap-1 transition-colors"
                        style={{ color: colors.textMuted }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = colors.textSecondary)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
                    >
                        <ClipboardList className="w-4 h-4" />
                        {formatNumber(taskCount)}
                    </Link>

                    <Dot />

                    <Link
                        href="/templates"
                        className="flex items-center gap-1 transition-colors"
                        style={{ color: colors.textMuted }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = colors.textSecondary)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
                    >
                        <Repeat className="w-4 h-4" />
                        {formatNumber(templateCount)}
                    </Link>

                    <Dot />

                    <span>Opdateret {updatedAt}</span>

                    <Dot />

                    <DropdownMenu
                        trigger={
                            <button
                                type="button"
                                aria-label="Projekt handlinger"
                                className="flex items-center transition-colors cursor-pointer"
                                style={{ color: colors.textMuted }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = colors.textSecondary)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        }
                        items={[
                            { label: "Rediger", icon: <SquarePen className="w-4 h-4" />, onClick: onEdit },
                            { label: "Slet", icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, danger: true, dividerBefore: true },
                        ]}
                    />
                </div>
            </td>

            {/* Activity bar */}
            <td className="py-3.5 px-4 hidden sm:table-cell">
                <ProjectActivityBar tasks={tasks} color={colors.greenMid} projectName={project.name} />
            </td>
        </tr>
    );
}
