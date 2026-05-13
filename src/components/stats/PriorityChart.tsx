"use client";

import type { PriorityStats } from "@/types/stats";
import Badge from "@/components/common/label/Badge";
import { TaskPriority } from "@/types/task";

interface PriorityChartProps {
    data: PriorityStats;
}

export default function PriorityChart({ data }: PriorityChartProps) {
    const priorities = [
        { key: "high", label: "Høj", color: "bg-red-500", data: data.high, priority: TaskPriority.HIGH },
        { key: "medium", label: "Mellem", color: "bg-orange-500", data: data.medium, priority: TaskPriority.MEDIUM },
        { key: "low", label: "Lav", color: "bg-yellow-500", data: data.low, priority: TaskPriority.LOW },
    ];

    const totalTasks = priorities.reduce((sum, p) => sum + p.data.total, 0);

    const getPercentage = (value: number) => {
        return totalTasks > 0 ? Math.round((value / totalTasks) * 100) : 0;
    };

    return (
        <div className="rounded-lg border p-6 bg-surface border-border">
            <h3 className="h3 mb-6">Prioritetsfordeling</h3>

            {/* Stacked bar */}
            <div className="mb-6">
                <div className="flex h-8 rounded-lg overflow-hidden">
                    {priorities.map((priority) => {
                        const percentage = getPercentage(priority.data.total);
                        if (percentage === 0) return null;

                        return (
                            <div
                                key={priority.key}
                                className={`${priority.color} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                                title={`${priority.label}: ${priority.data.total} opgaver`}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Stats grid */}
            <div className="space-y-4">
                {priorities.map((priority) => (
                    <div key={priority.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="priority" value={priority.priority} />
                            </div>
                            <span className="label-md text-text-primary">
                                {priority.data.total} opgaver
                            </span>
                        </div>

                        <div className="ml-5 grid grid-cols-3 gap-2 label-sm">
                            <div className="flex flex-col">
                                <span className="label-sm text-text-muted">Total</span>
                                <span className="label-md text-text-primary">{priority.data.total}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="label-sm text-text-muted">Fuldført</span>
                                <span className="label-md text-green-600">{priority.data.completed}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="label-sm text-text-muted">Forfalden</span>
                                <span className="label-md text-red-600">{priority.data.overdue}</span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="ml-5">
                            <div className="w-full bg-border rounded-full h-1.5">
                                <div
                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${priority.data.total > 0 ? (priority.data.completed / priority.data.total) * 100 : 0}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
