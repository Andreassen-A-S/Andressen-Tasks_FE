"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getUsers } from "@/lib/api";
import { UserRole, getUserRoleLabel, type User } from "@/types/users";
import EmployeeList from "./EmployeeList";
import Modal from "../modal/Modal";
import CreateEmployeeForm from "./CreateEmployeeForm";
import { faArrowDownWideShort, faArrowUpShortWide, faCaretDown, faFont, faPlus } from "@fortawesome/free-solid-svg-icons";
import { faIdBadge, faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../common/buttons/Button";
import DropdownMenu from "../common/DropdownMenu";
import FilterBar from "../common/table/FilterBar";

type EmployeeSortField = "name" | "position" | "role";

const sortFieldLabelMap: Record<EmployeeSortField, string> = {
    name: "Navn",
    position: "Stilling",
    role: "Rolle",
};

export default function EmployeePage() {
    const [employees, setEmployees] = useState<User[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
    const [positionFilter, setPositionFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<EmployeeSortField>("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
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
    }, [employees, positionFilter, roleFilter, sortField]);

    const anyFiltersActive = roleFilter !== "all" || positionFilter !== "all";
    const selectedRoleLabel = roleFilter === "all" ? "Alle" : getUserRoleLabel(roleFilter);
    const selectedPositionLabel = positionFilter === "all" ? "Alle stillinger" : positionFilter;

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
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="h1 flex items-center gap-3">
                            Medarbejdere
                        </h1>
                        <p className="body-sm">
                            {employees.length} medarbejdere
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="lg"
                        icon={faPlus}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Ny medarbejder
                    </Button>
                </div>
            </div>

            <div className="mx-8 mt-3 px-4 sm:px-6 lg:px-8 pb-12 flex flex-col gap-3">
                <FilterBar
                    left={
                        <>
                            <DropdownMenu
                                trigger={
                                    <Button variant="ghost" size="md" className="-ml-1">
                                        Rolle: {selectedRoleLabel}
                                        <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                                    </Button>
                                }
                                items={[
                                    { label: "Alle", checked: roleFilter === "all", onClick: () => setRoleFilter("all") },
                                    { label: "Administrator", checked: roleFilter === UserRole.ADMIN, onClick: () => setRoleFilter(UserRole.ADMIN) },
                                    { label: "Bruger", checked: roleFilter === UserRole.USER, onClick: () => setRoleFilter(UserRole.USER) },
                                ]}
                            />
                            {positionOptions.length > 0 && (
                                <DropdownMenu
                                    trigger={
                                        <Button variant="ghost" size="md">
                                            Stilling: {selectedPositionLabel}
                                            <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                                        </Button>
                                    }
                                    items={[
                                        { label: "Alle stillinger", checked: positionFilter === "all", onClick: () => setPositionFilter("all") },
                                        ...positionOptions.map((position) => ({
                                            label: position,
                                            checked: positionFilter === position,
                                            onClick: () => setPositionFilter(position),
                                        })),
                                    ]}
                                />
                            )}
                        </>
                    }
                    right={
                        <>
                            {anyFiltersActive && (
                                <Button
                                    variant="ghost"
                                    size="md"
                                    onClick={() => { setRoleFilter("all"); setPositionFilter("all"); }}
                                >
                                    Ryd filtre
                                </Button>
                            )}
                            <DropdownMenu
                                trigger={
                                    <Button variant="ghost" size="md" className="-mr-1">
                                        <FontAwesomeIcon icon={sortDirection === "asc" ? faArrowUpShortWide : faArrowDownWideShort} className="w-4 h-4" />
                                        {sortFieldLabelMap[sortField]}
                                        <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                                    </Button>
                                }
                                items={[
                                    { label: "Navn", icon: faFont, checked: sortField === "name", onClick: () => setSortField("name") },
                                    { label: "Stilling", icon: faIdBadge, checked: sortField === "position", onClick: () => setSortField("position") },
                                    { label: "Rolle", icon: faUser, checked: sortField === "role", onClick: () => setSortField("role") },
                                    { label: "Stigende", icon: faArrowUpShortWide, checked: sortDirection === "asc", dividerBefore: true, onClick: () => setSortDirection("asc") },
                                    { label: "Faldende", icon: faArrowDownWideShort, checked: sortDirection === "desc", onClick: () => setSortDirection("desc") },
                                ]}
                            />
                        </>
                    }
                />
                <EmployeeList
                    employees={filteredEmployees}
                    onEmployeeUpdate={loadEmployees}
                    onEmployeeDelete={handleEmployeeDeleted}
                />

                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Opret Ny Medarbejder"
                    maxWidth="sm"
                    footer={
                        <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                            <Button
                                type="submit"
                                form={createFormId}
                                loading={createLoading}
                                variant="primary"
                                size="md"
                            >
                                Opret medarbejder
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                disabled={createLoading}
                                variant="secondary"
                                size="md"
                            >
                                Annuller
                            </Button>
                        </div>
                    }
                >
                    <CreateEmployeeForm
                        formId={createFormId}
                        onLoadingChange={setCreateLoading}
                        onSuccess={handleEmployeeCreated}
                    />
                </Modal>
            </div>
        </div>

    );
}
