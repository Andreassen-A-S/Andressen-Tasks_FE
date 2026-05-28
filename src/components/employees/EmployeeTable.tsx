"use client";

import { Fragment, useMemo, useState } from "react";
import type { User } from "@/types/users";
import type { Organization } from "@/types/organization";
import { toast } from "sonner";
import { deleteUser } from "@/lib/api/users";
import EmployeeRow from "./EmployeeRow";
import Modal from "../modal/Modal";
import UpdateEmployeeForm from "./UpdateEmployeeForm";
import ConfirmModal from "@/components/common/ConfirmModal";
import Button from "../common/buttons/Button";
import DataTable, { RowGroup } from "@/components/common/table/DataTable";
import { colors } from "@/constants/colors";
import { MESTERPLAN_ORG_ID } from "@/constants/org";

interface EmployeeTableProps {
    employees: User[];
    organizations?: Organization[];
    onEmployeeUpdate: () => void;
    onEmployeeDelete: (userId: string) => void;
}

const columns = [
    { key: "employee", header: "Medarbejder", className: "px-6 py-2.5 label-sm min-w-[260px]" },
    { key: "position", header: "Stilling", className: "px-6 py-2.5 label-sm" },
    { key: "email", header: "Email", className: "px-6 py-2.5 label-sm min-w-[240px]" },
    { key: "role", header: "Rolle", className: "px-6 py-2.5 label-sm" },
    { key: "actions", header: "", className: "py-2.5 w-px pr-4" },
];

export default function EmployeeTable({
    employees = [],
    organizations,
    onEmployeeUpdate,
    onEmployeeDelete,
}: EmployeeTableProps) {
    const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const editFormId = "edit-employee-form";
    const groupOrganizations = organizations && organizations.length > 0 ? organizations : undefined;

    const grouped = useMemo(() => {
        if (!groupOrganizations) return null;
        const map = new Map<string, User[]>();
        for (const emp of employees) {
            const key = emp.organization_id ?? "__none__";
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(emp);
        }
        return map;
    }, [employees, groupOrganizations]);

    const sortedKeys = useMemo(() => {
        if (!grouped || !groupOrganizations) return null;
        const orgKeys = [...groupOrganizations]
            .sort((a, b) => {
                if (a.org_id === MESTERPLAN_ORG_ID) return -1;
                if (b.org_id === MESTERPLAN_ORG_ID) return 1;
                return a.name.localeCompare(b.name, "da");
            })
            .map(o => o.org_id);
        const ungrouped = [...grouped.keys()].filter(k => k === "__none__");
        return [...orgKeys, ...ungrouped];
    }, [grouped, groupOrganizations]);

    function handleEditClick(employee: User) {
        setSelectedEmployee(employee);
        setShowEditModal(true);
    }

    function handleEditSuccess() {
        setShowEditModal(false);
        setSelectedEmployee(null);
        onEmployeeUpdate();
    }

    function handleEditCancel() {
        setShowEditModal(false);
        setSelectedEmployee(null);
    }

    function handleDelete(employeeId: string) {
        setPendingDeleteId(employeeId);
        setConfirmOpen(true);
    }

    async function handleConfirmDelete() {
        if (!pendingDeleteId) return;
        setDeleteLoading(true);
        try {
            await deleteUser(pendingDeleteId);
            onEmployeeDelete(pendingDeleteId);
            setConfirmOpen(false);
            setPendingDeleteId(null);
        } catch (error) {
            console.error("Failed to delete employee:", error);
            toast.error("Kunne ikke slette medarbejderen. Prøv igen senere.");
        } finally {
            setDeleteLoading(false);
        }
    }

    if (employees.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-text-muted mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                </div>
                <h3 className="h3 text-text-primary mb-2">Ingen medarbejdere fundet</h3>
                <p className="body-md text-text-muted">Der er endnu ikke tilføjet nogen medarbejdere til systemet.</p>
            </div>
        );
    }

    return (
        <>
            <DataTable columns={columns}>
                {grouped && sortedKeys ? sortedKeys.map((key) => {
                    const members = grouped.get(key) ?? [];
                    const orgName = groupOrganizations!.find(o => o.org_id === key)?.name ?? (key === "__none__" ? "Ukategoriseret" : key);
                    return (
                        <Fragment key={key}>
                            <RowGroup label={orgName} colSpan={5} count={members.length}>
                                {members.length > 0 ? members.map((employee) => (
                                    <EmployeeRow key={employee.user_id} employee={employee} onEdit={handleEditClick} onDelete={handleDelete} />
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-3">
                                            <span className="body-sm" style={{ color: colors.textMuted }}>Ingen medarbejdere i denne organisation</span>
                                        </td>
                                    </tr>
                                )}
                            </RowGroup>
                        </Fragment>
                    );
                }) : employees.map((employee) => (
                    <EmployeeRow key={employee.user_id} employee={employee} onEdit={handleEditClick} onDelete={handleDelete} />
                ))}
            </DataTable>

            <Modal
                isOpen={showEditModal}
                onClose={handleEditCancel}
                title="Rediger medarbejder"
                maxWidth="sm"
                footer={
                    <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                        <Button
                            type="submit"
                            form={editFormId}
                            loading={editLoading}
                            variant="primary"
                            size="md"
                        >
                            Opdater medarbejder
                        </Button>
                        <Button
                            type="button"
                            onClick={handleEditCancel}
                            disabled={editLoading}
                            variant="secondary"
                            size="md"
                        >
                            Annuller
                        </Button>
                    </div>
                }
            >
                {selectedEmployee && (
                    <UpdateEmployeeForm
                        formId={editFormId}
                        user={selectedEmployee}
                        onLoadingChange={setEditLoading}
                        onSuccess={handleEditSuccess}
                        onPictureChange={onEmployeeUpdate}
                    />
                )}
            </Modal>

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
                onConfirm={handleConfirmDelete}
                title="Slet medarbejder"
                description="Er du sikker på, at du vil slette denne medarbejder?"
                confirmLabel="Slet"
                cancelLabel="Annuller"
                danger
                loading={deleteLoading}
            />
        </>
    );
}
