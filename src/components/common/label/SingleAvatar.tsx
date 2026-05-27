"use client";

import { getInitials, getAvatarColor } from "@/helpers/helpers";
import FloatingTooltip from "@/components/common/tooltip/FloatingTooltip";

interface SingleAvatarProps {
    name: string;
    size?: "xxs" | "xs" | "sm" | "md" | "lg" | "xxl";
    className?: string;
    tooltip?: string;
    imageUrl?: string | null;
    border?: boolean;
}

export default function SingleAvatar({
    name,
    size = "md",
    className = "",
    tooltip,
    imageUrl,
    border,
}: SingleAvatarProps) {
    const borderClass = border ? "ring-1 ring-border" : "";
    const sizeClasses = {
        xxs: "w-5 h-5 initials-xs rounded",
        xs: "w-7 h-7 initials-sm rounded-full",
        sm: "w-9 h-9 text-[12px] initials-md rounded-full",
        md: "w-10 h-10 initials-md rounded-full",
        lg: "w-11 h-11 initials-lg rounded-full",
        xxl: "w-16 h-16 initials-lg rounded-full",
    };

    const avatar = imageUrl ? (
        <div className={`${sizeClasses[size]} shrink-0 overflow-hidden ${borderClass} ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        </div>
    ) : (
        <div
            className={`
                ${sizeClasses[size]}
                flex items-center justify-center
                ${getAvatarColor(name)}
                ${borderClass}
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