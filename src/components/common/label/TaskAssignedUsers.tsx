"use client";

import { formatNumber } from "@/helpers/helpers";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import MultiUserCard from "@/components/common/MultiUserCard";

export interface AvatarUser {
    id: string;
    name: string;
    position?: string;
    profile_picture_url?: string | null;
}

interface TaskAssignedUsersProps {
    users: AvatarUser[];
    loading?: boolean;
    className?: string;
    size?: "sm" | "md";
    ringColor?: string;
}

export default function TaskAssignedUsers({
    users,
    loading = false,
    className = "",
    size = "md",
    ringColor = "ring-surface",
}: TaskAssignedUsersProps) {
    const avatarSize = size === "sm" ? "xs" : "sm";
    const stackSpacing = size === "sm" ? "-space-x-1.5" : "-space-x-1.75";
    const moreSize = size === "sm" ? "w-7 h-7 initials-sm" : "w-9 h-9 initials-md";
    const skeletonSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";

    if (loading) {
        return (
            <div className={`flex items-center ${className}`}>
                <div className={`${skeletonSize} rounded-full bg-border animate-pulse`} />
            </div>
        );
    }

    if (users.length === 0) {
        return <span className={`body-xs text-text-muted ${className}`}>Ikke tildelt</span>;
    }

    const maxVisible = 3;
    const visible = users.slice(0, maxVisible);
    const remaining = users.length - maxVisible;

    return (
        <MultiUserCard users={users}>
            <div className={`flex items-center cursor-pointer ${className}`}>
                <div className={`flex ${stackSpacing}`}>
                    {visible.map((u, i) => (
                        <div key={u.id} style={{ zIndex: visible.length - i }}>
                            <SingleAvatar
                                name={u.name}
                                size={avatarSize}
                                imageUrl={u.profile_picture_url}
                                className={`ring-2 ${ringColor}`}
                            />
                        </div>
                    ))}
                    {remaining > 0 && (
                        <div
                            className={`${moreSize} rounded-full ring-2 ${ringColor} bg-nav-inactive flex items-center justify-center`}
                            style={{ zIndex: 0 }}
                        >
                            +{formatNumber(remaining)}
                        </div>
                    )}
                </div>
            </div>
        </MultiUserCard>
    );
}
