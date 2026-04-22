"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers } from "@/lib/api";
import type { User } from "@/types/users";
import EmployeeList from "./EmployeeList";
import Modal from "../modal/Modal";
import CreateEmployeeForm from "./CreateEmployeeForm";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Button from "../common/buttons/Button";

export default function EmployeePage() {
    const [employees, setEmployees] = useState<User[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [loading, setLoading] = useState(true);
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

            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pb-12">
                <EmployeeList
                    employees={employees}
                    onEmployeeUpdate={loadEmployees}
                    onEmployeeDelete={handleEmployeeDeleted} />

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
