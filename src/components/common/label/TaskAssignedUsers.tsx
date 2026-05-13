"use client";

import type { TaskAssignment } from "@/types/assignment";
import { getInitials, getAvatarColor, formatNumber } from "@/helpers/helpers";
import FloatingTooltip from "@/components/common/tooltip/FloatingTooltip";

interface TaskAssignedUsersProps {
    assignments: TaskAssignment[];
    loading?: boolean;
    className?: string;
    size?: "sm" | "md";
}

export default function TaskAssignedUsers({
    assignments,
    loading = false,
    className = "",
    size = "md",
}: TaskAssignedUsersProps) {
    const sizeClasses = {
        sm: {
            skeleton: "w-6 h-6 rounded-md",
            stack: "-space-x-1.5",
            avatar: "w-6 h-6 rounded-md initials-sm border-2 border-surface",
            more: "w-6 h-6 rounded-md initials-sm border-2 border-surface",
            tooltipAvatar: "w-5 h-5 rounded-md initials-sm",
        },
        md: {
            skeleton: "w-8 h-8 rounded-lg",
            stack: "-space-x-1.75",
            avatar: "w-8 h-8 rounded-lg initials-md border-2 border-surface",
            more: "w-8 h-8 rounded-lg initials-lg border-2 border-surface",
            tooltipAvatar: "w-6 h-6 rounded-lg initials-md",
        },
    } as const;

    const currentSize = sizeClasses[size];

    if (loading) {
        return (
            <div className={`flex items-center ${className}`}>
                <div className={`${currentSize.skeleton} bg-border animate-pulse`} />
            </div>
        );
    }

    if (assignments.length === 0) {
        return <span className={`body-xs text-text-muted ${className}`}>Ikke tildelt</span>;
    }

    const maxVisible = 3;
    const visible = assignments.slice(0, maxVisible);
    const remaining = assignments.length - maxVisible;

    const trigger = (
        <div className={`flex items-center cursor-pointer ${className}`}>
            <div className={`flex ${currentSize.stack}`}>
                {visible.map((a, i) => (
                    <div
                        key={a.assignment_id}
                        className={`${currentSize.avatar} flex items-center justify-center relative ${getAvatarColor(a.user.name)}`}
                        style={{ zIndex: visible.length - i }}
                    >
                        {getInitials(a.user.name)}
                    </div>
                ))}
                {remaining > 0 && (
                    <div className={`${currentSize.more} bg-nav-inactive flex items-center justify-center`} style={{ zIndex: 0 }}>
                        +{formatNumber(remaining)}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <FloatingTooltip
            content={
                <div className="space-y-1">
                    {assignments.map((a) => (
                        <div key={a.assignment_id} className="flex items-center gap-2">
                            <div className={`${currentSize.tooltipAvatar} flex items-center justify-center ${getAvatarColor(a.user.name)}`}>
                                {getInitials(a.user.name)}
                            </div>
                            <div>
                                <div className="h5">{a.user.name}</div>
                                <div className="body-xs text-text-secondary">{a.user.position}</div>
                            </div>
                        </div>
                    ))}
                </div>
            }
            placement="bottom-start"
            offsetPx={8}
            variant="card"
            className="min-w-max"
        >
            {trigger}
        </FloatingTooltip>
    );
}
