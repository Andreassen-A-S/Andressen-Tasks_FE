"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers } from "@/lib/api";
import type { User } from "@/types/users";
import EmployeeList from "./EmployeeList";

export default function EmployeePage() {
    const [employees, setEmployees] = useState<User[]>([]);
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
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Medarbejdere</h1>
                <p className="text-gray-600">Oversigt over alle medarbejdere i systemet</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900">
                            Alle Medarbejdere ({employees.length})
                        </h2>
                        <button
                            onClick={() => {
                                // Future: Open add employee modal
                                console.log("Add employee clicked");
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Tilføj Medarbejder
                        </button>
                    </div>
                </div>

                <EmployeeList employees={employees} onEmployeeUpdate={loadEmployees} />
            </div>
        </div>
    );
}