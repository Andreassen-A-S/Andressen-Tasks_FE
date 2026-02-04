"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserAssignments, getTask } from "@/lib/api";
import { Task } from "@/types/task";
import { formatRelativeDate, translatePriority, translateStatus } from "@/helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSpinner, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

export default function UserTasksView() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserTasks = async () => {
            try {
                setIsLoading(true);
                if (!user?.user_id) return;

                // Get assignments for this user
                const assignments = await getUserAssignments(user.user_id);

                // Fetch full task details for each assignment
                const taskPromises = assignments.map(assignment =>
                    getTask(assignment.task_id)
                );
                const userTasks = await Promise.all(taskPromises);

                setTasks(userTasks);
            } catch (err) {
                setError("Kunne ikke hente opgaver");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.user_id) {
            fetchUserTasks();
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mine Opgaver</h1>
                        <p className="text-sm text-gray-600 mt-1">Velkommen, {user?.name || user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Log ud</span>
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto p-6">
                {tasks.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FontAwesomeIcon icon={faCheckCircle} size="3x" className="mb-4 text-gray-300" />
                        <p className="text-lg text-gray-600">Du har ingen opgaver tildelt</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <div
                                key={task.task_id}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {task.title}
                                        </h3>
                                        {task.description && (
                                            <p className="text-gray-600 mb-4">
                                                {task.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.status === 'DONE'
                                                    ? 'bg-green-100 text-green-800'
                                                    : task.status === 'REJECTED'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {translateStatus(task.status)}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.priority === 'HIGH'
                                                    ? 'bg-red-100 text-red-800'
                                                    : task.priority === 'MEDIUM'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                Prioritet: {translatePriority(task.priority)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right ml-6">
                                        <div className="text-sm font-medium text-gray-500 mb-1">
                                            Deadline
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            {formatRelativeDate(task.deadline)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}