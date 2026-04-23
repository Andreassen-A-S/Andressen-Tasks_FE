"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserRole, getUserRoleLabel } from "@/types/users";
import EmployeeTable from "./EmployeeTable";
import EmployeeFilterRow, { type EmployeeSortField, type SortDirection } from "./EmployeeFilterRow";
import EmployeeCreateModal from "./EmployeeCreateModal";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Button from "../common/buttons/Button";
import PageHeader from "@/components/common/PageHeader";
import TableSkeleton from "@/components/common/loading/TableSkeleton";
import { adminQueryKeys, fetchEmployeesPageData, type EmployeesPageData } from "@/lib/queries/admin";

export default function EmployeePage() {
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
    const [positionFilter, setPositionFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<EmployeeSortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const createFormId = "create-employee-form";
    const { data, isPending } = useQuery({
        queryKey: adminQueryKeys.employeesPage,
        queryFn: fetchEmployeesPageData,
    });

    const employees = useMemo(() => data?.employees ?? [], [data?.employees]);

    const handleEmployeeCreated = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.employeesPage });
        setShowCreateModal(false);
    }, [queryClient]);

    const handleEmployeeDeleted = useCallback((userId: string) => {
        queryClient.setQueryData<EmployeesPageData>(adminQueryKeys.employeesPage, (current) => {
            if (!current) return current;
            return {
                ...current,
                employees: current.employees.filter((employee) => employee.user_id !== userId),
            };
        });
    }, [queryClient]);

    const positionOptions = useMemo(
        () =>
            [...new Set(employees.map((employee) => employee.position).filter(Boolean))]
                .sort((a, b) => a.localeCompare(b, "da")),
        [employees]
    );

    const filteredEmployees = useMemo(() => {
        const filtered = employees.filter((employee) => {
            if (roleFilter !== "all" && employee.role !== roleFilter) return false;
            if (positionFilter !== "all" && employee.position !== positionFilter) return false;
            return true;
        });

        return [...filtered].sort((a, b) => {
            let result = 0;
            switch (sortField) {
                case "position":
                    result = (a.position || "").localeCompare(b.position || "", "da"); break;
                case "role":
                    result = getUserRoleLabel(a.role).localeCompare(getUserRoleLabel(b.role), "da"); break;
                case "name":
                default:
                    result = a.name.localeCompare(b.name, "da"); break;
            }
            return sortDirection === "asc" ? result : -result;
        });
    }, [employees, positionFilter, roleFilter, sortDirection, sortField]);

    const clearFilters = useCallback(() => {
        setRoleFilter("all");
        setPositionFilter("all");
    }, []);

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Medarbejdere"
                subtitle={`${employees.length} medarbejdere`}
                action={
                    <Button
                        variant="primary"
                        size="lg"
                        icon={faPlus}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Ny medarbejder
                    </Button>
                }
            />

            <div className="mx-8 mt-3 px-4 sm:px-6 lg:px-8 pb-12 flex flex-col gap-3">
                <EmployeeFilterRow
                    roleFilter={roleFilter}
                    positionFilter={positionFilter}
                    positionOptions={positionOptions}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onRoleFilterChange={setRoleFilter}
                    onPositionFilterChange={setPositionFilter}
                    onSortFieldChange={setSortField}
                    onSortDirectionChange={setSortDirection}
                    onClearFilters={clearFilters}
                />
                {isPending ? (
                    <TableSkeleton columns={5} rows={8} />
                ) : (
                    <EmployeeTable
                        employees={filteredEmployees}
                        onEmployeeUpdate={() => queryClient.invalidateQueries({ queryKey: adminQueryKeys.employeesPage })}
                        onEmployeeDelete={handleEmployeeDeleted}
                    />
                )}

                <EmployeeCreateModal
                    isOpen={showCreateModal}
                    loading={createLoading}
                    formId={createFormId}
                    onClose={() => setShowCreateModal(false)}
                    onLoadingChange={setCreateLoading}
                    onSuccess={handleEmployeeCreated}
                />
            </div>
        </div>

    );
}
