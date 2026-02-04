"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserAssignments, getTask } from "@/lib/api";
import { Task } from "@/types/task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSpinner, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import UserTaskDetails from "./UserTaskDetails";
import UserTaskCard from "./UserTaskCard";
import { sortTasks } from "@/helpers/sort";

export default function UserTasksView() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    // Reusable function to fetch and set tasks
    const fetchAndSetTasks = useCallback(async () => {
        if (!user?.user_id) {
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const assignments = await getUserAssignments(user.user_id);

            if (assignments.length === 0) {
                setTasks([]);
                return;
            }

            // Fetch all tasks in parallel
            const taskPromises = assignments.map(assignment =>
                getTask(assignment.task_id)
            );
            const userTasks = await Promise.all(taskPromises);
            setTasks(sortTasks(userTasks));
        } catch (err) {
            console.error("Error fetching tasks:", err);
            setError("Kunne ikke hente opgaver. Prøv igen senere.");
        } finally {
            setIsLoading(false);
        }
    }, [user?.user_id]);

    // Fetch tasks effect - runs when auth completes
    useEffect(() => {
        // Wait for auth to complete
        if (authLoading) {
            return;
        }

        // If no user after auth loads, do nothing (AuthWrapper handles redirect)
        if (!user?.user_id) {
            return;
        }

        fetchAndSetTasks();
    }, [user?.user_id, authLoading, fetchAndSetTasks]);

    const handleLogout = useCallback(() => {
        logout();
        router.push("/login");
    }, [logout, router]);

    const handleBackFromDetails = useCallback(() => {
        setSelectedTaskId(null);
        // Refresh tasks after returning from details
        fetchAndSetTasks();
    }, [fetchAndSetTasks]);

    const handleTaskClick = useCallback((taskId: string) => {
        setSelectedTaskId(taskId);
    }, []);

    const handleRetry = useCallback(() => {
        fetchAndSetTasks();
    }, [fetchAndSetTasks]);

    // Show task details view
    if (selectedTaskId) {
        return (
            <UserTaskDetails
                taskId={selectedTaskId}
                onBack={handleBackFromDetails}
            />
        );
    }

    // Show loading state while auth OR tasks are loading
    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-green-500 mb-4" />
                    <p className="text-gray-600">
                        {authLoading ? "Verificerer login..." : "Indlæser opgaver..."}
                    </p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-800 font-medium mb-4">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Prøv igen
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main view
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                            Mine Opgaver
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                            Velkommen, {user?.name || user?.email}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-4"
                        aria-label="Log ud"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span className="hidden sm:inline">Log ud</span>
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto p-4 sm:p-6">
                {tasks.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 sm:p-12 text-center">
                        <FontAwesomeIcon
                            icon={faCheckCircle}
                            size="3x"
                            className="mb-4 text-gray-300"
                        />
                        <p className="text-base sm:text-lg text-gray-600 font-medium">
                            Du har ingen opgaver tildelt
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Nye opgaver vil blive vist her
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {tasks.map((task) => (
                            <UserTaskCard
                                key={task.task_id}
                                task={task}
                                onClick={() => handleTaskClick(task.task_id)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}