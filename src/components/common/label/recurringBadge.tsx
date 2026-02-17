"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";

interface RecurringBadgeProps {
    size?: "sm" | "md" | "lg";

}

const sizeClasses = {
    sm: "px-2 py-0.5",
    md: "px-2.5 py-1",
    lg: "px-3 py-1.5",
};

export default function RecurringBadge({ size = "md" }: RecurringBadgeProps) {
    if (size === "sm") {
        return (
            <span className={`inline-flex items-center gap-1.5 ${sizeClasses.sm} badge bg-[#EBF0FD] text-[#2C5FE0] rounded-lg`}>
                <FontAwesomeIcon icon={faRepeat} className="w-3 h-3" />
                Gentages
            </span>
        );
    }

    if (size === "md") {
        return (
            <span className={`inline-flex items-center gap-1.5 ${sizeClasses.md} badge bg-[#EBF0FD] text-[#2C5FE0] rounded-lg`}>
                <FontAwesomeIcon icon={faRepeat} className="w-3 h-3" />
                Gentages
            </span>
        );
    }

    if (size === "lg") {
        return (
            <span className={`inline-flex items-center gap-1.5 ${sizeClasses.lg} badge bg-[#EBF0FD] text-[#2C5FE0] rounded-lg`}>
                <FontAwesomeIcon icon={faRepeat} className="w-3 h-3" />
                Gentages
            </span>
        );
    }

    return null;
}