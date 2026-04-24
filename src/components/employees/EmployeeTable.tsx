"use client";

import type { User } from "@/types/users";
import { toast } from "sonner";
import { useState } from "react";
import { deleteUser } from "@/lib/api/users";
import EmployeeRow from "./EmployeeRow";
import Modal from "../modal/Modal";
import UpdateEmployeeForm from "./UpdateEmployeeForm";
import ConfirmModal from "@/components/common/ConfirmModal";
import Button from "../common/buttons/Button";
import DataTable from "@/components/common/table/DataTable";

interface EmployeeTableProps {
    employees: User[];
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
                <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                </div>
                <h3 className="h3 text-gray-900 mb-2">Ingen medarbejdere fundet</h3>
                <p className="body-md text-gray-500">Der er endnu ikke tilføjet nogen medarbejdere til systemet.</p>
            </div>
        );
    }

    return (
        <>
            <DataTable columns={columns}>
                {employees.map((employee) => (
                    <EmployeeRow
                        key={employee.user_id}
                        employee={employee}
                        onEdit={handleEditClick}
                        onDelete={handleDelete}
                    />
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
