"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getUserAssignments } from "@/lib/api";
import { Task } from "@/types/task";
import UserTaskHeader from "../common/UserHeader";
import { useAuth } from "@/hooks/useAuth";
import CalendarMonthNavigator from "./CalenderMonthNavigator";
import CalendarTaskCard from "./CalendarTaskCard";
import BottomSheetModal from "../common/bottomSheetModal";
import UserTaskDetails from "../tasks/taskDetails/UserTaskDetails";
import { formatLocalDate } from "@/helpers/helpers";

export default function CalendarPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [bottomSheetTaskId, setBottomSheetTaskId] = useState<string | null>(null);

    useEffect(() => {
        if (user) fetchTasks();
    }, [currentDate, user]);

    const fetchTasks = async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            // Fetch assignments for the current user
            const assignments = await getUserAssignments(user.user_id);
            // Extract the task objects from assignments
            const tasksData = assignments
                .map(a => a.task)
                .filter(Boolean); // filter out any null/undefined tasks
            setTasks(tasksData);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Get previous month's trailing days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const prevMonthDays = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

        const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

        // Previous month days
        for (let i = prevMonthDays; i > 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - i + 1),
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            });
        }

        // Next month days to fill grid
        const remainingDays = 35 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            });
        }

        return days;
    };

    const getTasksForDate = (date: Date) => {
        const dateStr = formatLocalDate(date);
        return tasks.filter(task => {
            const taskDate = formatLocalDate(task.scheduled_date);
            return taskDate === dateStr;
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.toDateString() === date2.toDateString();
    };

    const days = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('da-DK', { month: 'long', year: 'numeric' });
    const selectedTasks = getTasksForDate(selectedDate);


    return (
        <div className="min-h-screen bg-[#F6F5F1] flex flex-col pb-20">
            {/* Header */}
            <div className="sticky">
                {/* Header */}
                <UserTaskHeader user={user!} header="Kalender" sub="Overblik over kommende opgaver" />
                {/* Month Navigation */}
                <CalendarMonthNavigator
                    monthName={monthName}
                    onPrev={() => changeMonth(-1)}
                    onNext={() => changeMonth(1)}
                />
            </div>



            {/* Calendar Grid */}
            <div className="px-3 pt-3 pb-2">
                <div className="max-w-[430px] mx-auto">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map((day) => (
                            <div
                                key={day}
                                className="text-[9px] font-semibold uppercase tracking-wider text-[#9DA1B4] text-center py-1"
                                style={{ letterSpacing: '0.05em' }}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {days.map((day, idx) => {
                            const dayTasks = getTasksForDate(day.date);
                            const hasTasks = dayTasks.length > 0;
                            const isSelected = isSameDay(day.date, selectedDate);
                            const isTodayDate = isToday(day.date);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(day.date)}
                                    className={`
                    h-10 flex flex-col items-center justify-center rounded-lg transition-colors
                    ${!day.isCurrentMonth ? 'opacity-30' : ''}
                    ${isTodayDate ? 'bg-[#0f6e56]' : isSelected ? 'bg-[#E8E6E1]' : 'hover:bg-[#FAFAF7]'}
                  `}
                                >
                                    <div
                                        className={`text-[13px] font-medium ${isTodayDate ? 'text-white font-bold' : 'text-[#1B1D22]'
                                            }`}
                                        style={{ fontFamily: 'Outfit, sans-serif' }}
                                    >
                                        {day.date.getDate()}
                                    </div>
                                    {hasTasks && (
                                        <div
                                            className={`w-1 h-1 rounded-full mt-0.5 ${isTodayDate ? 'bg-white/70' : 'bg-[#0f6e56]'
                                                }`}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="h-px bg-[#E8E6E1] mx-3" />

            {/* Selected Day Tasks */}
            <div className="flex-1 px-3 pt-3 overflow-y-auto">
                <div className="max-w-[430px] mx-auto">
                    <div
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#9DA1B4] mb-2.5 px-1"
                        style={{ letterSpacing: '0.08em' }}
                    >
                        {selectedDate.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })} — {selectedTasks.length} opgaver
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <FontAwesomeIcon icon={faSpinner} spin className="text-[#0f6e56] text-2xl" />
                        </div>
                    ) : selectedTasks.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-14 h-14 bg-white border border-[#E8E6E1] rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-[#9DA1B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="text-[16px] font-semibold text-[#1B1D22] mb-1">Ingen opgaver</div>
                            <div className="text-[13px] text-[#9DA1B4]">Der er ingen planlagte opgaver denne dag</div>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {selectedTasks.map((task) => (
                                <CalendarTaskCard key={task.task_id} task={task} onClick={() => setBottomSheetTaskId(task.task_id)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* Bottom Sheet Modal for Task Details */}
            <BottomSheetModal
                open={!!bottomSheetTaskId}
                onClose={() => setBottomSheetTaskId(null)}
            >
                {bottomSheetTaskId && (
                    <div className="p-4 sm:p-6">
                        <UserTaskDetails
                            taskId={bottomSheetTaskId}
                            onBack={() => setBottomSheetTaskId(null)}
                        />
                    </div>
                )}
            </BottomSheetModal>
        </div>
    );
}