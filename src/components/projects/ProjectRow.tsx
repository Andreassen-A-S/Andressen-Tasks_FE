"use client";

import { faListCheck, faRotate, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import DropdownMenu from "@/components/common/DropdownMenu";
import { formatCommentDate, formatNumber } from "@/helpers/helpers";
import ProjectActivityBar from "./ProjectActivityBar";
import { colors } from "@/constants/colors";
import OutlineGearIcon from "@/components/common/icons/OutlineGearIcon";

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
                <p className="label-lg mb-1" style={{ color: colors.textPrimary }}>{project.name}</p>

                {/* Line 2: description */}
                {project.description && (
                    <p className="body-xs mb-2 line-clamp-1" style={{ color: colors.textSecondary }}>{project.description}</p>
                )}

                {/* Line 3: metadata strip */}
                <div className="flex items-center gap-2 body-xs flex-wrap" style={{ color: colors.textMuted }}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />

                    <Dot />

                    <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faListCheck} className="w-3 h-3" />
                        {formatNumber(taskCount)}
                    </span>

                    <Dot />

                    <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faRotate} className="w-3 h-3" />
                        {formatNumber(templateCount)}
                    </span>

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
                                <OutlineGearIcon className="w-4 h-3.5" />
                            </button>
                        }
                        items={[
                            { label: "Rediger", icon: faPenToSquare, onClick: onEdit },
                            { label: "Slet", icon: faTrash, onClick: onDelete, danger: true, dividerBefore: true },
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
