"use client";

import { useState, useCallback, useMemo } from "react";
import { formatNumber } from "@/helpers/helpers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserRole, getUserRoleLabel } from "@/types/users";
import { useAuth } from "@/hooks/useAuth";
import { getOrganizations } from "@/lib/api/organizations";
import EmployeeTable from "./EmployeeTable";
import EmployeeFilterRow, { type EmployeeSortField, type SortDirection } from "./EmployeeFilterRow";
import EmployeeCreateModal from "./EmployeeCreateModal";
import { Plus } from "lucide-react";
import { colors } from "@/constants/colors";
import Button from "../common/buttons/Button";
import PageHeader from "@/components/common/PageHeader";
import TableSkeleton from "@/components/common/loading/TableSkeleton";
import { adminQueryKeys, fetchEmployeesPageData, type EmployeesPageData } from "@/lib/queries/admin";
import { MESTERPLAN_ORG_ID } from "@/constants/org";
import PageContainer from "@/components/layout/PageContainer";

export default function EmployeePage() {
    const queryClient = useQueryClient();
    const { user, contextOrgId } = useAuth();
    const isInMesterplanContext = user?.organization_id === MESTERPLAN_ORG_ID && !contextOrgId;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
    const [positionFilter, setPositionFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<EmployeeSortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const createFormId = "create-employee-form";
    const { data, isPending, isError } = useQuery({
        queryKey: adminQueryKeys.employeesPage,
        queryFn: fetchEmployeesPageData,
    });

    const { data: organizations = [] } = useQuery({
        queryKey: ["organizations"],
        queryFn: getOrganizations,
        enabled: isInMesterplanContext,
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
            [...new Set(employees.map((employee) => employee.position?.name).filter(Boolean) as string[])]
                .sort((a, b) => a.localeCompare(b, "da")),
        [employees]
    );

    const filteredEmployees = useMemo(() => {
        const filtered = employees.filter((employee) => {
            if (roleFilter !== "all" && employee.role !== roleFilter) return false;
            if (positionFilter !== "all" && employee.position?.name !== positionFilter) return false;
            return true;
        });

        return [...filtered].sort((a, b) => {
            let result = 0;
            switch (sortField) {
                case "position":
                    result = (a.position?.name || "").localeCompare(b.position?.name || "", "da"); break;
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
                subtitle={`${formatNumber(employees.length)} medarbejdere`}
                action={
                    <Button
                        variant="primary"
                        size="lg"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Ny medarbejder
                    </Button>
                }
            />

            <PageContainer className="mt-3 px-8 pb-12 flex flex-col gap-3">
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
                ) : isError ? (
                    <div className="rounded-md border px-6 py-12 text-center" style={{ borderColor: colors.border }}>
                        <p className="body-md" style={{ color: colors.textMuted }}>Kunne ikke hente medarbejdere. Prøv igen senere.</p>
                    </div>
                ) : (
                    <EmployeeTable
                        employees={filteredEmployees}
                        organizations={isInMesterplanContext ? organizations : undefined}
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
            </PageContainer>
        </div>

    );
}
