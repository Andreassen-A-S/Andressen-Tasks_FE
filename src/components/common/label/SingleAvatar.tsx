"use client";

import { getInitials, getAvatarColor } from "@/helpers/helpers";

interface SingleAvatarProps {
    name: string;
    size?: "xxs" | "xs" | "sm" | "md" | "lg";
    className?: string;
}

export default function SingleAvatar({
    name,
    size = "md",
    className = ""
}: SingleAvatarProps) {
    const sizeClasses = {
        xxs: "w-4 h-4 initials-xs rounded",
        xs: "w-6 h-6 initials-sm rounded-lg",
        sm: "w-8 h-8 text-[12px] initials-md rounded-lg",
        md: "w-[26px] h-[26px] initials-md rounded-lg",
        lg: "w-[34px] h-[34px] initials-lg rounded-lg",
    };

    return (
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
}