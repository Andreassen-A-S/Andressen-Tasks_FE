"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { TaskAssignment } from "@/types/assignment";
import { getInitials, getAvatarColor } from "@/helpers/helpers";

interface TaskAssignedUsersProps {
    assignments: TaskAssignment[];
    loading?: boolean;
    className?: string;
}

export default function TaskAssignedUsers({ assignments, loading = false, className = "" }: TaskAssignedUsersProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [pos, setPos] = useState({ bottom: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    if (loading) {
        return (
            <div className={`flex items-center ${className}`}>
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>
        );
    }

    if (assignments.length === 0) {
        return <span className={`body-xs text-[#9DA1B4] ${className}`}>Ikke tildelt</span>;
    }

    const maxVisible = 3;
    const visible = assignments.slice(0, maxVisible);
    const remaining = assignments.length - maxVisible;

    function handleMouseEnter() {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPos({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
        }
        setShowTooltip(true);
    }

    return (
        <div
            ref={triggerRef}
            className={`flex items-center relative cursor-pointer ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className="flex -space-x-1.75">
                {visible.map((a, i) => (
                    <div
                        key={a.assignment_id}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center initials-md border-2 border-white relative ${getAvatarColor(a.user.name)}`}
                        style={{ zIndex: visible.length - i }}
                    >
                        {getInitials(a.user.name)}
                    </div>
                ))}
                {remaining > 0 && (
                    <div className="w-8 h-8 rounded-lg bg-[#A8AABB] flex items-center justify-center initials-lg border-2 border-white" style={{ zIndex: 0 }}>
                        +{remaining}
                    </div>
                )}
            </div>

            {showTooltip && typeof document !== "undefined" && createPortal(
                <div
                    className="fixed z-[9999] bg-white text-[#1B1D22] rounded-lg p-3 min-w-max border border-[#E8E6E1] animate-in fade-in duration-100"
                    style={pos}
                >
                    <div className="space-y-1">
                        {assignments.map((a) => (
                            <div key={a.assignment_id} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center initials-md ${getAvatarColor(a.user.name)}`}>
                                    {getInitials(a.user.name)}
                                </div>
                                <div>
                                    <div className="h5">{a.user.name}</div>
                                    <div className="body-xs text-[#6B7084]">{a.user.position}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
