"use client";

import { formatLocalDate } from "@/helpers/helpers";
import type { TrendDataPoint } from "@/types/stats";

interface TrendChartProps {
    data: TrendDataPoint[];
}

export default function TrendChart({ data }: TrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-lg border p-6 bg-white border-gray-200">
                <h3 className="h3 mb-4">Opgavetrends</h3>
                <p className="body-md text-center py-8">Ingen trenddata tilgængelig</p>
            </div>
        );
    }

    // Calculate max value for scaling
    const maxValue = Math.max(
        ...data.map(d => Math.max(d.created, d.completed))
    );
    const scale = maxValue > 0 ? 100 / maxValue : 1;

    // Format date for display
    const formatDate = (dateStr: string) => {
        return formatLocalDate(dateStr, "da-DK", { month: "short", day: "numeric" });
    };

    return (
        <div className="rounded-lg border p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h3 className="h3">Opgavetrends</h3>
                <div className="flex items-center gap-4 label-md">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="label-md text-gray-600">Oprettet</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="label-md text-gray-600">Fuldført</span>
                    </div>
                </div>
            </div>

            {/* Simple bar chart */}
            <div className="space-y-3">
                {data.map((point) => (
                    <div key={point.date} className="space-y-1">
                        <div className="flex items-center justify-between label-sm text-gray-600">
                            <span className="font-medium">{formatDate(point.date)}</span>
                            <div className="flex gap-3">
                                <span className="text-blue-600 label-md">{point.created} oprettet</span>
                                <span className="text-green-600 label-md">{point.completed} fuldført</span>
                            </div>
                        </div>
                        <div className="flex gap-2 h-8">
                            {/* Created bar */}
                            <div className="flex-1 bg-gray-100 rounded overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500 ease-out rounded"
                                    style={{ width: `${point.created * scale}%` }}
                                />
                            </div>
                            {/* Completed bar */}
                            <div className="flex-1 bg-gray-100 rounded overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-500 ease-out rounded"
                                    style={{ width: `${point.completed * scale}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="h2 text-blue-600">
                            {data.reduce((sum, d) => sum + d.created, 0)}
                        </p>
                        <p className="label-md text-gray-600">Total oprettet</p>
                    </div>
                    <div>
                        <p className="h2 text-green-600">
                            {data.reduce((sum, d) => sum + d.completed, 0)}
                        </p>
                        <p className="label-md text-gray-600">Total fuldført</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
