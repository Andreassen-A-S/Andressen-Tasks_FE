"use client";

import {
    ArrowDownWideNarrow,
    ArrowUpNarrowWide,
    ChevronDown,
    IdCard,
    Type,
    User,
} from "lucide-react";
import Button from "@/components/common/buttons/Button";
import DropdownMenu from "@/components/common/DropdownMenu";
import FilterBar from "@/components/common/table/FilterBar";
import { getUserRoleLabel, UserRole } from "@/types/users";

export type EmployeeSortField = "name" | "position" | "role";
export type SortDirection = "asc" | "desc";

interface EmployeeFilterRowProps {
    roleFilter: UserRole | "all";
    positionFilter: string;
    positionOptions: string[];
    sortField: EmployeeSortField;
    sortDirection: SortDirection;
    onRoleFilterChange: (role: UserRole | "all") => void;
    onPositionFilterChange: (position: string) => void;
    onSortFieldChange: (field: EmployeeSortField) => void;
    onSortDirectionChange: (direction: SortDirection) => void;
    onClearFilters: () => void;
}

const sortFieldLabelMap: Record<EmployeeSortField, string> = {
    name: "Navn",
    position: "Stilling",
    role: "Rolle",
};

export default function EmployeeFilterRow({
    roleFilter,
    positionFilter,
    positionOptions,
    sortField,
    sortDirection,
    onRoleFilterChange,
    onPositionFilterChange,
    onSortFieldChange,
    onSortDirectionChange,
    onClearFilters,
}: EmployeeFilterRowProps) {
    const anyFiltersActive = roleFilter !== "all" || positionFilter !== "all";
    const selectedRoleLabel = roleFilter === "all" ? "Alle" : getUserRoleLabel(roleFilter);
    const selectedPositionLabel = positionFilter === "all" ? "Alle stillinger" : positionFilter;

    return (
        <FilterBar
            left={
                <>
                    <DropdownMenu
                        trigger={
                            <Button variant="ghost" size="md" className="-ml-1">
                                Rolle: {selectedRoleLabel}
                                <ChevronDown className="w-3 h-3" />
                            </Button>
                        }
                        items={[
                            { label: "Alle", checked: roleFilter === "all", onClick: () => onRoleFilterChange("all") },
                            { label: "Administrator", checked: roleFilter === UserRole.ADMIN, onClick: () => onRoleFilterChange(UserRole.ADMIN) },
                            { label: "Bruger", checked: roleFilter === UserRole.USER, onClick: () => onRoleFilterChange(UserRole.USER) },
                        ]}
                    />
                    {positionOptions.length > 0 && (
                        <DropdownMenu
                            trigger={
                                <Button variant="ghost" size="md">
                                    Stilling: {selectedPositionLabel}
                                    <ChevronDown className="w-3 h-3" />
                                </Button>
                            }
                            items={[
                                { label: "Alle stillinger", checked: positionFilter === "all", onClick: () => onPositionFilterChange("all") },
                                ...positionOptions.map((position) => ({
                                    label: position,
                                    checked: positionFilter === position,
                                    onClick: () => onPositionFilterChange(position),
                                })),
                            ]}
                        />
                    )}
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
                                {sortDirection === "asc" ? (
                                    <ArrowUpNarrowWide className="w-4 h-4" />
                                ) : (
                                    <ArrowDownWideNarrow className="w-4 h-4" />
                                )}
                                {sortFieldLabelMap[sortField]}
                                <ChevronDown className="w-3 h-3" />
                            </Button>
                        }
                        items={[
                            { label: "Navn", icon: <Type className="w-4 h-4" />, checked: sortField === "name", onClick: () => onSortFieldChange("name") },
                            { label: "Stilling", icon: <IdCard className="w-4 h-4" />, checked: sortField === "position", onClick: () => onSortFieldChange("position") },
                            { label: "Rolle", icon: <User className="w-4 h-4" />, checked: sortField === "role", onClick: () => onSortFieldChange("role") },
                            {
                                label: "Stigende",
                                icon: <ArrowUpNarrowWide className="w-4 h-4" />,
                                checked: sortDirection === "asc",
                                dividerBefore: true,
                                onClick: () => onSortDirectionChange("asc"),
                            },
                            {
                                label: "Faldende",
                                icon: <ArrowDownWideNarrow className="w-4 h-4" />,
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
