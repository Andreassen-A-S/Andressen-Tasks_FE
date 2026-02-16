"use client";

import type { User } from "@/types/users";
import { useState } from "react";
import { deleteUser } from "@/lib/api/users";
import EmployeeRow from "./EmployeeRow";
import Modal from "../modal/Modal";
import UpdateEmployeeForm from "./UpdateEmployeeForm";

interface EmployeeListProps {
    employees: User[];
    onEmployeeUpdate: () => void;
    onEmployeeDelete: (userId: string) => void;
}



export default function EmployeeList({ employees = [], onEmployeeUpdate, onEmployeeDelete,
}: EmployeeListProps) {
    const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);


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

    async function handleDelete(employeeId: string) {
        if (!confirm("Er du sikker på at du vil slette denne medarbejder?")) return;
        try {
            await deleteUser(employeeId);
            onEmployeeDelete(employeeId);
        } catch (error) {
            console.error("Failed to delete employee:", error);
            alert("Kunne ikke slette medarbejderen. Prøv igen senere.");
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
            <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="w-full text-left">
                        <tr>
                            <th className="px-6 py-3 table-header">
                                Medarbejder
                            </th>
                            <th className="px-6 py-3 table-header">
                                Stilling
                            </th>
                            <th className="px-6 py-3 table-header">
                                Email
                            </th>
                            <th className="px-6 py-3 table-header">
                                Status
                            </th>
                            <th className="px-6 py-3 table-header">
                                Handlinger
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((employee) => (
                            <EmployeeRow
                                key={employee.user_id}
                                employee={employee}
                                onEdit={handleEditClick}
                                onDelete={handleDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Edit Employee Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={handleEditCancel}
                title={<span className="h3">Rediger Medarbejder</span>}
                maxWidth="md"
            >
                {selectedEmployee && (
                    <UpdateEmployeeForm
                        user={selectedEmployee}
                        onSuccess={handleEditSuccess}
                        onCancel={handleEditCancel}
                    />
                )}
            </Modal>
        </>
    );
}