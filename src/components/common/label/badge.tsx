"use client";

import { TaskPriority, TaskStatus } from "@/types/task";
import { getPriorityColors, getStatusColors, translatePriority, translateStatus } from "@/helpers/helpers";

type BadgeVariant = "priority" | "status";

interface BadgeProps {
    variant: BadgeVariant;
    value: TaskPriority | TaskStatus;
}

export default function Badge({ variant, value }: BadgeProps) {
    if (variant === "priority") {
        const priority = value as TaskPriority;
        return (
            <span className={`px-3 py-2 text-xs rounded-lg font-bold border ${getPriorityColors(priority)}`}>
                {translatePriority(priority)}
            </span>
        );
    }

    if (variant === "status") {
        const status = value as TaskStatus;
        return (
            <span className={`px-3 py-2 text-xs rounded-lg font-bold border ${getStatusColors(status)}`}>
                {translateStatus(status)}
            </span>
        );
    }

    return null;
}