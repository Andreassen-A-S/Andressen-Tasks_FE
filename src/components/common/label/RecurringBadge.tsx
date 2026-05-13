"use client";

import { Repeat } from "lucide-react";

interface RecurringBadgeProps {
    size?: "sm" | "md" | "lg";
    iconOnly?: boolean;
}

const sizeClasses = {
    sm: "inline-flex items-center h-5 px-2 gap-1.5 badge-sm",
    md: "inline-flex items-center h-6 px-2.5 gap-1.5 badge-md",
    lg: "inline-flex items-center h-7 px-3 gap-1.5 badge-lg",
};

export default function RecurringBadge({ size = "md", iconOnly = false }: RecurringBadgeProps) {
    const iconOnlyClasses = {
        sm: "inline-flex items-center justify-center h-5 w-5 badge-sm",
        md: "inline-flex items-center justify-center h-6 w-6 badge-md",
        lg: "inline-flex items-center justify-center h-7 w-7 badge-lg",
    };

    if (size === "sm") {
        return (
            <span className={`${iconOnly ? iconOnlyClasses.sm : sizeClasses.sm} badge bg-info-surface text-link rounded-lg`}>
                <Repeat className="w-3 h-3" />
                {!iconOnly && "Gentages"}
            </span>
        );
    }

    if (size === "md") {
        return (
            <span className={`${iconOnly ? iconOnlyClasses.md : sizeClasses.md} badge bg-info-surface text-link rounded-lg`}>
                <Repeat className="w-3 h-3" />
                {!iconOnly && "Gentages"}
            </span>
        );
    }

    if (size === "lg") {
        return (
            <span className={`${iconOnly ? iconOnlyClasses.lg : sizeClasses.lg} badge bg-info-surface text-link rounded-lg`}>
                <Repeat className="w-3 h-3" />
                {!iconOnly && "Gentages"}
            </span>
        );
    }

    return null;
}
