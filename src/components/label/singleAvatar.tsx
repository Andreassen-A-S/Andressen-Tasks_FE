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
        xs: "w-6 h-6 text-[8px] border-[2px] border-white ",
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base"
    };

    return (
        <div
            className={`
                
                ${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium
                ${getAvatarColor(name)}
                ${className}
            `}
        >
            {getInitials(name)}
        </div>
    );
}