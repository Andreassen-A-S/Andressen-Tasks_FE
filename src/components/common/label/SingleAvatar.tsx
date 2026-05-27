"use client";

import { getInitials, getAvatarColor } from "@/helpers/helpers";
import FloatingTooltip from "@/components/common/tooltip/FloatingTooltip";

interface SingleAvatarProps {
    name: string;
    size?: "xxs" | "xs" | "sm" | "md" | "lg";
    className?: string;
    tooltip?: string;
    imageUrl?: string | null;
}

export default function SingleAvatar({
    name,
    size = "md",
    className = "",
    tooltip,
    imageUrl,
}: SingleAvatarProps) {
    const sizeClasses = {
        xxs: "w-4 h-4 initials-xs rounded",
        xs: "w-6 h-6 initials-sm rounded-lg",
        sm: "w-8 h-8 text-[12px] initials-md rounded-lg",
        md: "w-[26px] h-[26px] initials-md rounded-lg",
        lg: "w-[34px] h-[34px] initials-lg rounded-lg",
    };

    const avatar = imageUrl ? (
        <div className={`${sizeClasses[size]} flex-shrink-0 overflow-hidden ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        </div>
    ) : (
        <div
            className={`
                ${sizeClasses[size]}
                flex items-center justify-center
                ${getAvatarColor(name)}
                ${className}
            `}
        >
            {getInitials(name)}
        </div>
    );

    if (!tooltip) return avatar;

    return (
        <FloatingTooltip content={tooltip} placement="top" variant="bare">
            {avatar}
        </FloatingTooltip>
    );
}