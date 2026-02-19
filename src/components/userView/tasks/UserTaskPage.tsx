"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserAssignments, getTask } from "@/lib/api";
import { Task, TaskGoalType, TaskPriority, TaskStatus } from "@/types/task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import UserTaskDetails from "./taskDetails/UserTaskDetails";
import BottomSheetModal from "../common/bottomSheetModal";
import UserTaskCard from "./UserTaskCard";
import { sortTasks } from "@/helpers/sort";
import { toLocalDateKey } from "@/helpers/helpers";
import UserTaskHeader from "../common/UserHeader";
import UserTaskDateNavigator from "./UserTaskDateNavigator";

const FILTERS = [
    { key: "all", label: "Alle" },
    { key: "highPriority", label: "Høj prioritet" },
    { key: "pending", label: "Mangler" },
    { key: "fixedGoal", label: "Mål-opgaver" },
];

export default function UserTasksView() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filter, setFilter] = useState("all");
    const [bottomSheetTaskId, setBottomSheetTaskId] = useState<string | null>(null);

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

    const handleTaskClick = useCallback((taskId: string) => {
        setBottomSheetTaskId(taskId);
    }, []);

    const handleRetry = useCallback(() => {
        fetchAndSetTasks();
    }, [fetchAndSetTasks]);


    const todayStr = toLocalDateKey(selectedDate);


    const tasksForDay = tasks.filter(task => {
        const isDone = task.status === TaskStatus.DONE;

        const scheduledDate = task.scheduled_date
            ? toLocalDateKey(task.scheduled_date)
            : null;

        const deadlineDate = task.deadline
            ? toLocalDateKey(task.deadline)
            : null;

        const isScheduledToday = scheduledDate === todayStr;
        const isCarryOverScheduled = !!scheduledDate && scheduledDate < todayStr && !isDone;

        const isDueToday = deadlineDate === todayStr;
        const isOverdue = !!deadlineDate && deadlineDate < todayStr && !isDone;

        return isScheduledToday || isCarryOverScheduled || isDueToday || isOverdue;
    });

    const filteredTasks = tasksForDay.filter(task => {


        // Filter logic
        if (filter === "recurring") return task.recurring_template_id !== null;
        if (filter === "highPriority") return task.priority === TaskPriority.HIGH;
        if (filter === "pending") return (task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS);
        if (filter === "fixedGoal") return task.goal_type === TaskGoalType.FIXED;

        return true;
    });



    // Show loading state while auth OR tasks are loading
    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-[#0f6e56]" />
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
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
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
        <div className="min-h-screen">

            <div className="sticky">
                {/* Header */}
                <UserTaskHeader user={user!} header="Mine opgaver" sub={`Velkommen, ${user?.name || user?.email}`} />
                {/* Date Navigation Bar */}
                <UserTaskDateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
            </div>

            {/* Filter pills */}
            <div className="w-full mx-auto px-4 sm:px-6 mt-2 overflow-x-auto">
                <div className="flex gap-2">
                    {FILTERS.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setFilter(key)}
                            className={
                                "label-lg-gray px-4 py-1.5 rounded-full border text-sm font-medium transition-colors whitespace-nowrap " +
                                (filter === key
                                    ? "bg-gray-900 label-lg-white"
                                    : "bg-transparent border-gray-200 hover:border-gray-300")
                            }
                        >
                            {key === "all" ? `${label} (${tasksForDay.length})` : label}
                        </button>
                    ))}
                </div>
            </div>



            {/* Content */}
            <main className="w-full mx-auto px-4 mt-2 sm:p-6">
                {filteredTasks.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 sm:p-12 text-center">
                        <FontAwesomeIcon
                            icon={faCheckCircle}
                            size="3x"
                            className="mb-4 text-gray-300"
                        />
                        <p className="text-base sm:text-lg text-gray-600 font-medium">
                            Ingen opgaver planlagt for denne dag
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Nye opgaver vil blive vist her
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {filteredTasks.map((task) => (
                            <UserTaskCard
                                key={task.task_id}
                                task={task}
                                onClick={() => handleTaskClick(task.task_id)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Task Details */}
            <BottomSheetModal
                open={!!bottomSheetTaskId}
                onClose={() => setBottomSheetTaskId(null)}
            >
                {bottomSheetTaskId && (
                    <UserTaskDetails
                        taskId={bottomSheetTaskId}
                        onBack={() => setBottomSheetTaskId(null)}
                    />
                )}
            </BottomSheetModal>
        </div>
    );
}
