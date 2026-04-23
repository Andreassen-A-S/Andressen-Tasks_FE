"use client";

import { faCalendar, faClock, faFlag } from "@fortawesome/free-regular-svg-icons";
import {
    faArrowDownWideShort,
    faArrowUpShortWide,
    faCaretDown,
    faClockRotateLeft,
    faFont,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Project } from "@/types/project";
import { TaskStatus } from "@/types/task";
import type { User } from "@/types/users";
import Button from "@/components/common/buttons/Button";
import DropdownMenu from "@/components/common/DropdownMenu";
import FilterBar from "@/components/common/table/FilterBar";

export type TaskSortField = "created_at" | "deadline" | "start_date" | "priority" | "title";
export type SortDirection = "asc" | "desc";

interface TaskFilterRowProps {
    projects: Project[];
    users: User[];
    statusFilter: TaskStatus | "all";
    projectFilter: string;
    assigneeFilter: string;
    creatorFilter: string;
    sortField: TaskSortField;
    sortDirection: SortDirection;
    onStatusFilterChange: (status: TaskStatus | "all") => void;
    onProjectFilterChange: (projectId: string) => void;
    onAssigneeFilterChange: (userId: string) => void;
    onCreatorFilterChange: (userId: string) => void;
    onSortFieldChange: (field: TaskSortField) => void;
    onSortDirectionChange: (direction: SortDirection) => void;
    onClearFilters: () => void;
}

const statusLabelMap: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: "Mangler",
    [TaskStatus.IN_PROGRESS]: "I gang",
    [TaskStatus.DONE]: "Udført",
    [TaskStatus.REJECTED]: "Annulleret",
    [TaskStatus.ARCHIVED]: "Arkiveret",
};

const sortFieldLabelMap: Record<TaskSortField, string> = {
    created_at: "Seneste",
    deadline: "Deadline",
    start_date: "Startdato",
    priority: "Prioritet",
    title: "Titel",
};

export default function TaskFilterRow({
    projects,
    users,
    statusFilter,
    projectFilter,
    assigneeFilter,
    creatorFilter,
    sortField,
    sortDirection,
    onStatusFilterChange,
    onProjectFilterChange,
    onAssigneeFilterChange,
    onCreatorFilterChange,
    onSortFieldChange,
    onSortDirectionChange,
    onClearFilters,
}: TaskFilterRowProps) {
    const selectedProjectLabel = projectFilter === "all"
        ? "Alle projekter"
        : projects.find((project) => project.project_id === projectFilter)?.name ?? "Alle projekter";
    const selectedAssigneeLabel = assigneeFilter === "all"
        ? "Alle"
        : users.find((user) => user.user_id === assigneeFilter)?.name ?? "Alle";
    const selectedCreatorLabel = creatorFilter === "all"
        ? "Alle"
        : users.find((user) => user.user_id === creatorFilter)?.name ?? "Alle";
    const selectedStatusLabel = statusFilter === "all" ? "Alle" : statusLabelMap[statusFilter];
    const anyFiltersActive =
        statusFilter !== "all" ||
        projectFilter !== "all" ||
        assigneeFilter !== "all" ||
        creatorFilter !== "all";

    return (
        <FilterBar
            left={
                <>
                    <DropdownMenu
                        trigger={
                            <Button variant="ghost" size="md" className="-ml-1">
                                Status: {selectedStatusLabel}
                                <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                            </Button>
                        }
                        items={[
                            { label: "Alle", checked: statusFilter === "all", onClick: () => onStatusFilterChange("all") },
                            { label: "Mangler", checked: statusFilter === TaskStatus.PENDING, onClick: () => onStatusFilterChange(TaskStatus.PENDING) },
                            { label: "I gang", checked: statusFilter === TaskStatus.IN_PROGRESS, onClick: () => onStatusFilterChange(TaskStatus.IN_PROGRESS) },
                            { label: "Udført", checked: statusFilter === TaskStatus.DONE, onClick: () => onStatusFilterChange(TaskStatus.DONE) },
                            { label: "Annulleret", checked: statusFilter === TaskStatus.REJECTED, onClick: () => onStatusFilterChange(TaskStatus.REJECTED) },
                            { label: "Arkiveret", checked: statusFilter === TaskStatus.ARCHIVED, onClick: () => onStatusFilterChange(TaskStatus.ARCHIVED) },
                        ]}
                    />
                    {projects.length > 0 && (
                        <DropdownMenu
                            trigger={
                                <Button variant="ghost" size="md">
                                    Projekt: {selectedProjectLabel}
                                    <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                                </Button>
                            }
                            items={[
                                { label: "Alle projekter", checked: projectFilter === "all", onClick: () => onProjectFilterChange("all") },
                                ...projects.map((project) => ({
                                    label: project.name,
                                    checked: projectFilter === project.project_id,
                                    onClick: () => onProjectFilterChange(project.project_id),
                                })),
                            ]}
                        />
                    )}
                    <DropdownMenu
                        trigger={
                            <Button variant="ghost" size="md">
                                Tildelte: {selectedAssigneeLabel}
                                <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                            </Button>
                        }
                        items={[
                            { label: "Alle", checked: assigneeFilter === "all", onClick: () => onAssigneeFilterChange("all") },
                            ...users.map((user) => ({
                                label: user.name,
                                checked: assigneeFilter === user.user_id,
                                onClick: () => onAssigneeFilterChange(user.user_id),
                            })),
                        ]}
                    />
                    <DropdownMenu
                        trigger={
                            <Button variant="ghost" size="md">
                                Oprettet af: {selectedCreatorLabel}
                                <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                            </Button>
                        }
                        items={[
                            { label: "Alle", checked: creatorFilter === "all", onClick: () => onCreatorFilterChange("all") },
                            ...users.map((user) => ({
                                label: user.name,
                                checked: creatorFilter === user.user_id,
                                onClick: () => onCreatorFilterChange(user.user_id),
                            })),
                        ]}
                    />
                </>
            }
            right={
                <>
                    {anyFiltersActive && (
                        <Button variant="ghost" size="md" onClick={onClearFilters}>
                            Ryd filtre
                        </Button>
                    )}
                    <DropdownMenu
                        trigger={
                            <Button variant="ghost" size="md" className="-mr-1">
                                <FontAwesomeIcon
                                    icon={sortDirection === "asc" ? faArrowUpShortWide : faArrowDownWideShort}
                                    className="w-4 h-4"
                                />
                                {sortFieldLabelMap[sortField]}
                                <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                            </Button>
                        }
                        items={[
                            { label: "Seneste", icon: faClockRotateLeft, checked: sortField === "created_at", onClick: () => onSortFieldChange("created_at") },
                            { label: "Deadline", icon: faClock, checked: sortField === "deadline", onClick: () => onSortFieldChange("deadline") },
                            { label: "Startdato", icon: faCalendar, checked: sortField === "start_date", onClick: () => onSortFieldChange("start_date") },
                            { label: "Prioritet", icon: faFlag, checked: sortField === "priority", onClick: () => onSortFieldChange("priority") },
                            { label: "Titel", icon: faFont, checked: sortField === "title", onClick: () => onSortFieldChange("title") },
                            {
                                label: "Stigende",
                                icon: faArrowUpShortWide,
                                checked: sortDirection === "asc",
                                dividerBefore: true,
                                onClick: () => onSortDirectionChange("asc"),
                            },
                            {
                                label: "Faldende",
                                icon: faArrowDownWideShort,
                                checked: sortDirection === "desc",
                                onClick: () => onSortDirectionChange("desc"),
                            },
                        ]}
                    />
                </>
            }
        />
    );
}
