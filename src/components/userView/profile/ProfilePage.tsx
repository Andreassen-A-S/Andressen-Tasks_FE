"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser, faRightFromBracket, faSpinner, faCheck, faChevronRight, faMoon } from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle, faCalendar } from "@fortawesome/free-regular-svg-icons";
import { getMyStats, getUser, getUserAssignments } from "@/lib/api";
import { UserStats } from "@/types/stats";
import { User } from "@/types/users";
import ProfileHeader from "./ProfileHeader";
import { TaskAssignment } from "@/types/assignment";
import { getTodayAssignmentStats } from "@/helpers/helpers";


export default function ProfilePage() {
    const authContext = useContext(AuthContext);
    const currentUser = authContext?.user;
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [assignmentData, setAssignmentData] = useState<TaskAssignment[] | null>(null);
    const { assignedToday, completedToday } = getTodayAssignmentStats(assignmentData || []);



    useEffect(() => {
        if (currentUser?.user_id) {
            fetchStats();
            fetchUserDetails();
            fetchAssignments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);
    const fetchUserDetails = async () => {
        if (!currentUser?.user_id) return;

        try {
            setIsLoading(true);
            const userData = await getUser(currentUser.user_id);
            setUserDetails(userData);
        } catch (err) {
            console.error("Error fetching user details:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAssignments = async () => {
        if (!currentUser?.user_id) return;

        try {
            setIsLoading(true);
            const assignmentsData = await getUserAssignments(currentUser.user_id);
            setAssignmentData(assignmentsData);
        } catch (err) {
            console.error("Error fetching assignments:", err);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchStats = async () => {
        if (!currentUser?.user_id) return;

        try {
            setIsLoading(true);
            const statsData = await getMyStats();
            setStats(statsData);
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        if (confirm("Er du sikker på at du vil logge ud?")) {
            authContext?.logout();
        }
    };



    if (!currentUser) {
        return (
            <div className="min-h-screen bg-[#F6F5F1] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} spin size="2xl" className="text-[#0f6e56]" />
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-[#F6F5F1] flex flex-col pb-20">
            {/* Header */}
            <ProfileHeader user={currentUser} position={userDetails?.position} />

            {/* Stats Cards */}
            <div className="px-5 pt-4">
                <div className="max-w-[430px] mx-auto grid grid-cols-3 gap-2">
                    <div className="bg-white border border-[#E8E6E1] rounded-xl p-3">
                        <div className="h2">
                            {isLoading ? "—" : assignedToday || "n/a"}
                        </div>
                        <div className="overline">I dag</div>
                    </div>
                    <div className="bg-white border border-[#E8E6E1] rounded-xl p-3">
                        <div className="h2-color text-[#2D9F6F]">
                            {isLoading ? "—" : completedToday || "n/a"}
                        </div>
                        <div className="overline">Færdige</div>
                    </div>
                    <div className="bg-white border border-[#E8E6E1] rounded-xl p-3">
                        <div className="h2-color text-[#D64545]">
                            {isLoading ? "—" : stats?.overdue_tasks || "n/a"}
                        </div>
                        <div className="overline">Forfaldne</div>
                    </div>
                </div>
            </div>

            {/* This Week Section */}
            <div className="px-5 pt-6">
                <div className="max-w-[430px] mx-auto">
                    <div className="overline mb-3">Denne uge</div>
                    <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden">

                        {/* Completion Rate */}
                        <div className="flex items-center px-4 py-3 border-b border-[#E8E6E1]">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#E8F7F0]">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-[#0f6e56] text-sm" />
                            </div>
                            <span className="label-lg flex-1 ml-3">Fuldførelsesrate</span>
                            <span className="mono-md">
                                {isLoading ? "—" : `${stats?.weekly_stats?.completion_rate || "n/a"}%`}
                            </span>
                        </div>

                        {/* Assigned Tasks */}
                        <div className="flex items-center px-4 py-3 border-b border-[#E8E6E1]">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#F3F3F0]">
                                <FontAwesomeIcon icon={faCalendar} className="text-[#6B7084] text-sm" />
                            </div>
                            <span className="label-lg flex-1 ml-3">Opgaver tildelt</span>
                            <span className="mono-md">
                                {isLoading ? "—" : stats?.weekly_stats?.assigned_tasks || "n/a"}
                            </span>
                        </div>

                        {/* Completed */}
                        <div className="flex items-center px-4 py-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#E8F7F0]">
                                <FontAwesomeIcon icon={faCheck} className="text-[#0f6e56]" />
                            </div>
                            <span className="label-lg flex-1 ml-3">Fuldført</span>
                            <span className="mono-md">
                                {isLoading ? "—" : stats?.weekly_stats?.completed_tasks || "n/a"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Section */}
            <div className="px-5 pt-6">
                <div className="max-w-[430px] mx-auto">
                    <div className="overline mb-3">Indstillinger</div>
                    <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden">

                        {/* Notifications */}
                        <button className="w-full flex items-center px-4 py-3 border-b border-[#E8E6E1] hover:bg-[#FAFAF7] transition-colors">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: "#F3F3F0" }}
                            >
                                <FontAwesomeIcon icon={faBell} className="text-[#6B7084] text-sm" />
                            </div>
                            <span className="label-lg flex-1 ml-3 text-left">Notifikationer</span>
                            <FontAwesomeIcon icon={faChevronRight} className="text-[#9DA1B4]" size="xs" />
                        </button>

                        {/* Theme */}
                        <button className="w-full flex items-center px-4 py-3 border-b border-[#E8E6E1] hover:bg-[#FAFAF7] transition-colors">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#F3F3F0]">
                                <FontAwesomeIcon icon={faMoon} className="text-[#6B7084]" size="sm" />
                            </div>
                            <span className="label-lg flex-1 ml-3 text-left">Tema</span>
                            <span className="label-sm mr-2">Lyst</span>
                            <FontAwesomeIcon icon={faChevronRight} className="text-[#9DA1B4]" size="xs" />
                        </button>

                        {/* Email */}
                        <div className="flex items-center px-4 py-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#F3F3F0]">
                                <FontAwesomeIcon icon={faUser} className="text-[#6B7084]" size="sm" />
                            </div>
                            <span className="label-lg flex-1 ml-3 text-left truncate">
                                {currentUser.email}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="px-5 pt-4">
                <div className="max-w-[430px] mx-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full h-10 bg-transparent border border-[#D64545] rounded-xl text-[#D64545] btn-md hover:bg-[#FDECEC] transition-colors flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} className="text-sm" />
                        Log ud
                    </button>
                </div>
            </div>
        </div>
    );
}