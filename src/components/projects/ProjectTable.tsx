"use client";

import { faArrowDownWideShort, faCaretDown, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import Button from "@/components/common/buttons/Button";
import DropdownMenu from "@/components/common/DropdownMenu";
import { colors } from "@/constants/colors";
import ProjectIcon from "@/components/common/icons/ProjectIcon";
import ProjectRow from "./ProjectRow";
import DataTable from "@/components/common/table/DataTable";

export type ProjectSortKey = "name" | "tasks" | "created";

interface ProjectTableProps {
    projects: Project[];
    taskCounts: Record<string, number>;
    templateCounts: Record<string, number>;
    tasksByProject: Record<string, Task[]>;
    sortBy: ProjectSortKey;
    onSortChange: (sortKey: ProjectSortKey) => void;
    onCreateClick: () => void;
    onEditProject: (project: Project) => void;
    onDeleteProject: (projectId: string) => void;
}

const sortLabels: Record<ProjectSortKey, string> = {
    name: "Navn",
    tasks: "Opgaver",
    created: "Oprettet",
};

export default function ProjectTable({
    projects,
    taskCounts,
    templateCounts,
    tasksByProject,
    sortBy,
    onSortChange,
    onCreateClick,
    onEditProject,
    onDeleteProject,
}: ProjectTableProps) {
    if (projects.length === 0) {
        return (
            <div className="text-center py-12">
                <ProjectIcon className="w-16 h-16 mb-4 inline-block" style={{ color: colors.border }} />
                <h3 className="h3 mb-2" style={{ color: colors.textPrimary }}>Ingen projekter endnu</h3>
                <p className="body-sm mb-6" style={{ color: colors.textSecondary }}>
                    Opret et projekt for at gruppere dine opgaver
                </p>
                <Button
                    variant="primary"
                    size="md"
                    icon={faPlus}
                    onClick={onCreateClick}
                >
                    Opret dit første projekt
                </Button>
            </div>
        );
    }

    return (
        <DataTable
            variant="single"
            toolbar={
                <>
                    <span className="label-lg" style={{ color: colors.textPrimary }}>
                        {projects.length} {projects.length === 1 ? "projekt" : "projekter"}
                    </span>
                    <DropdownMenu
                        trigger={
                            <Button variant="ghost" size="md" className="-mr-2" >
                                <FontAwesomeIcon icon={faArrowDownWideShort} className="w-4 h-4" />
                                {sortLabels[sortBy]}
                                <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                            </Button>
                        }
                        items={(["name", "tasks", "created"] as ProjectSortKey[]).map((key) => ({
                            label: sortLabels[key],
                            checked: sortBy === key,
                            onClick: () => onSortChange(key),
                        }))}
                    />
                </>
            }
        >
            {projects.map((project) => (
                <ProjectRow
                    key={project.project_id}
                    project={project}
                    taskCount={taskCounts[project.project_id] ?? 0}
                    templateCount={templateCounts[project.project_id] ?? 0}
                    tasks={tasksByProject[project.project_id] ?? []}
                    onEdit={() => onEditProject(project)}
                    onDelete={() => onDeleteProject(project.project_id)}
                />
            ))}
        </DataTable>
    );
}
