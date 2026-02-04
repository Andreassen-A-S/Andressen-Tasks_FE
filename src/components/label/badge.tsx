"use client";

import { TaskPriority, TaskStatus } from "@/types/task";
import { translatePriority, translateStatus } from "@/helpers/helpers";

type BadgeVariant = "priority" | "status";

interface BadgeProps {
    variant: BadgeVariant;
    value: TaskPriority | TaskStatus;
}

export default function Badge({ variant, value }: BadgeProps) {
    if (variant === "priority") {
        const priority = value as TaskPriority;
        const colorClasses = {
            [TaskPriority.HIGH]: "bg-red-100 text-red-600 font-bold border border-red-600",
            [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-600 font-bold border border-yellow-600",
            [TaskPriority.LOW]: "bg-green-100 text-green-600 font-bold border border-green-600",
        };

        return (
            <span className={`px-3 py-2 text-xs rounded-md ${colorClasses[priority]}`}>
                {translatePriority(priority)}
            </span>
        );
    }

    if (variant === "status") {
        const status = value as TaskStatus;
        const colorClasses = {
            [TaskStatus.DONE]: "bg-green-100 text-green-600 font-bold border border-green-600",
            [TaskStatus.PENDING]: "bg-yellow-100 text-yellow-600 font-bold border border-yellow-600",
            [TaskStatus.REJECTED]: "bg-red-100 text-red-600 font-bold border border-red-600",
        };

        return (
            <span className={`px-3 py-2 text-xs rounded-md ${colorClasses[status] || "bg-gray-100 text-gray-800"}`}>
                {translateStatus(status)}
            </span>
        );
    }

    return null;
}