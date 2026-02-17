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
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
};

export default function Badge({ variant, value, size = "md" }: BadgeProps) {
    const badgeSize = sizeClasses[size] || sizeClasses.md;

    if (variant === "priority") {
        const priority = value as TaskPriority;
        return (
            <span
                className={`badge rounded-lg ${badgeSize} ${getPriorityColors(priority)}`}
            >
                {translatePriority(priority)}
            </span>
        );
    }

    if (variant === "status") {
        const status = value as TaskStatus;
        return (
            <span
                className={`badge rounded-lg ${badgeSize} ${getStatusColors(status)}`}
            >
                {translateStatus(status)}
            </span>
        );
    }

    return null;
}