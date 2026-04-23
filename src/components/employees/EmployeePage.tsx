"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getUsers } from "@/lib/api";
import { UserRole, getUserRoleLabel, type User } from "@/types/users";
import EmployeeTable from "./EmployeeTable";
import EmployeeFilterRow, { type EmployeeSortField, type SortDirection } from "./EmployeeFilterRow";
import EmployeeCreateModal from "./EmployeeCreateModal";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Button from "../common/buttons/Button";
import PageHeader from "@/components/common/PageHeader";

export default function EmployeePage() {
    const [employees, setEmployees] = useState<User[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
    const [positionFilter, setPositionFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<EmployeeSortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const createFormId = "create-employee-form";

    const loadEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const users = await getUsers();
            setEmployees(users);
        } catch (error) {
            console.error("Failed to load employees:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEmployees();
    }, [loadEmployees]);

    const handleEmployeeCreated = useCallback(() => {
        loadEmployees();
        setShowCreateModal(false);
    }, [loadEmployees]);

    const handleEmployeeDeleted = useCallback((userId: string) => {
        setEmployees((prev) => prev.filter((e) => e.user_id !== userId));
    }, []);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Indlæser medarbejdere...</p>
                </div>
            </div>
        );
    }

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
                <EmployeeTable
                    employees={filteredEmployees}
                    onEmployeeUpdate={loadEmployees}
                    onEmployeeDelete={handleEmployeeDeleted}
                />

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
