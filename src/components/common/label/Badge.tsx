"use client";

import { TaskPriority, TaskStatus } from "@/types/task";
import { getPriorityColors, getStatusColors, translatePriority, translateStatus } from "@/helpers/helpers";

type BadgeVariant = "priority" | "status";

interface BadgeProps {
    variant: BadgeVariant;
    value: TaskPriority | TaskStatus;
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "inline-flex items-center h-5 px-1.5 badge-sm",
    md: "inline-flex items-center h-6 px-2 badge-md",
    lg: "inline-flex items-center h-7 px-2.5 badge-lg",
};

export default function Badge({ variant, value, size = "md" }: BadgeProps) {
    const badgeSize = sizeClasses[size] || sizeClasses.md;

    if (variant === "priority") {
        const priority = value as TaskPriority;
        return (
            <span
                className={`badge rounded-full border ${badgeSize} ${getPriorityColors(priority)}`}
            >
                {translatePriority(priority)}
            </span>
        );
    }

    if (variant === "status") {
        const status = value as TaskStatus;
        return (
            <span
                className={`badge rounded-full border ${badgeSize} ${getStatusColors(status)}`}
            >
                {translateStatus(status)}
            </span>
        );
    }

    return null;
}
