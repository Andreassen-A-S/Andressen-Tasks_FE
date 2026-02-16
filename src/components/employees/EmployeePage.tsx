"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers } from "@/lib/api";
import type { User } from "@/types/users";
import EmployeeList from "./EmployeeList";
import Modal from "../modal/Modal";
import CreateEmployeeForm from "./CreateEmployeeForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function EmployeePage() {
    const [employees, setEmployees] = useState<User[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

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
                            {/* num of taks and num of task with status high */}
                            {employees.length} medarbejdere
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex btn-lg items-center gap-2 px-5 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <FontAwesomeIcon icon={faPlus} size="sm" />
                        Ny medarbejder
                    </button>
                </div>
            </div>

            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pb-12">
                <EmployeeList
                    employees={employees}
                    onEmployeeUpdate={loadEmployees}
                    onEmployeeDelete={handleEmployeeDeleted} />

                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Opret Ny Medarbejder"
                    maxWidth="xl"
                >
                    <CreateEmployeeForm
                        onSuccess={handleEmployeeCreated}
                        onCancel={() => setShowCreateModal(false)}
                    />
                </Modal>
            </div>
        </div>

    );
}