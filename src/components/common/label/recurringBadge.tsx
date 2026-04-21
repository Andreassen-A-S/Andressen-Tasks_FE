"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";

interface RecurringBadgeProps {
    size?: "sm" | "md" | "lg";

}

const sizeClasses = {
    sm: "inline-flex items-center h-5 px-2 gap-1.5 badge-sm",
    md: "inline-flex items-center h-6 px-2.5 gap-1.5 badge-md",
    lg: "inline-flex items-center h-7 px-3 gap-1.5 badge-lg",
};

export default function RecurringBadge({ size = "md" }: RecurringBadgeProps) {
    if (size === "sm") {
        return (
            <span className={`${sizeClasses.sm} badge bg-[#EBF0FD] text-[#2C5FE0] rounded-lg`}>
                <FontAwesomeIcon icon={faRepeat} className="w-3 h-3" />
                Gentages
            </span>
        );
    }

    if (size === "md") {
        return (
            <span className={`${sizeClasses.md} badge bg-[#EBF0FD] text-[#2C5FE0] rounded-lg`}>
                <FontAwesomeIcon icon={faRepeat} className="w-3 h-3" />
                Gentages
            </span>
        );
    }

    if (size === "lg") {
        return (
            <span className={`${sizeClasses.lg} badge bg-[#EBF0FD] text-[#2C5FE0] rounded-lg`}>
                <FontAwesomeIcon icon={faRepeat} className="w-3 h-3" />
                Gentages
            </span>
        );
    }

    return null;
}
