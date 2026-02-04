"use client";

import { useState } from "react";
import type { TaskAssignment } from "@/types/assignment";

interface TaskAssignedUsersProps {
    assignments: TaskAssignment[];
    loading?: boolean;
    className?: string;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map(word => word.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
}

function getAvatarColor(name: string): string {
    const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-orange-500",
        "bg-teal-500",
        "bg-cyan-500"
    ];

    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

export default function TaskAssignedUsers({ assignments, loading = false, className = "" }: TaskAssignedUsersProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    if (loading) {
        return (
            <div className={`flex items-center ${className}`}>
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
        );
    }

    if (assignments.length === 0) {
        return (
            <span className={`text-sm text-gray-400 ${className}`}>
                Ikke tildelt
            </span>
        );
    }

    const maxVisible = 3;
    const visibleAssignments = assignments.slice(0, maxVisible);
    const remainingCount = assignments.length - maxVisible;

    return (
        <div
            className={`flex items-center relative cursor-pointer ${className}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* User avatars */}
            <div className="flex -space-x-2">
                {visibleAssignments.map((assignment, index) => (
                    <div
                        key={assignment.assignment_id}
                        className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium
                            border-2 border-white relative
                            ${getAvatarColor(assignment.user.name)}
                        `}
                        style={{ zIndex: visibleAssignments.length - index }}
                    >
                        {getInitials(assignment.user.name)}
                    </div>
                ))}

                {/* Show remaining count if more than maxVisible */}
                {remainingCount > 0 && (
                    <div
                        className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white relative"
                        style={{ zIndex: 0 }}
                    >
                        +{remainingCount}
                    </div>
                )}
            </div>

            {/* Tooltip */}
            {showTooltip && assignments.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 z-50 bg-gray-900 text-white text-sm rounded-lg shadow-lg p-3 min-w-max">
                    <div className="space-y-1">
                        {assignments.map((assignment) => (
                            <div key={assignment.assignment_id} className="flex items-center space-x-2">
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(assignment.user.name)}`}
                                >
                                    {getInitials(assignment.user.name)}
                                </div>
                                <div>
                                    <div className="font-medium">{assignment.user.name}</div>
                                    <div className="text-gray-300 text-xs">{assignment.user.position}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}