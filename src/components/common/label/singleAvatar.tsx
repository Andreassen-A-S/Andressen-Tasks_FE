"use client";

import { getInitials, getAvatarColor } from "@/helpers/helpers";

interface SingleAvatarProps {
    name: string;
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}

export default function SingleAvatar({
    name,
    size = "md",
    className = ""
}: SingleAvatarProps) {
    const sizeClasses = {
        xs: "w-6 h-6 initials-sm border-2",
        sm: "w-8 h-8 text-[12px] initials-md",
        md: "w-[26px] h-[26px] initials-md",
        lg: "w-[34px] h-[34px] initials-lg ",
    };

    return (
        <div
            className={`
                ${sizeClasses[size]}
                rounded-lg
                flex items-center justify-center
                ${getAvatarColor(name)}
                ${className}
            `}
        >
            {getInitials(name)}
        </div>
    );
}