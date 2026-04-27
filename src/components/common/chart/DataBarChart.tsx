"use client";

import { colors } from "@/constants/colors";
import type { CSSProperties, ReactNode } from "react";
import type { ContentType } from "recharts/types/component/Tooltip";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface DataBarChartSeries {
    key: string;
    name: string;
    color: string;
}

interface DataBarChartProps {
    data: object[];
    xDataKey: string;
    series: DataBarChartSeries[];
    toolbar?: ReactNode;
    height?: number;
    barGap?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    xTickFormatter?: (value: string) => string;
    xTickInterval?: number;
    yAxisWidth?: number;
    tooltipContent?: ContentType;
    cursor?: boolean;
    emptyState?: ReactNode;
    chartClassName?: string;
}

export default function DataBarChart({
    data,
    xDataKey,
    series,
    toolbar,
    height = 320,
    barGap = 3,
    margin = { top: 10, right: 12, bottom: 6, left: 0 },
    xTickFormatter,
    xTickInterval = 0,
    yAxisWidth = 34,
    tooltipContent,
    cursor = false,
    emptyState,
    chartClassName = "px-3 py-5",
}: DataBarChartProps) {
    const tickStyle = {
        fill: colors.textMuted,
        fontSize: 11,
        fontFamily: "IBM Plex Mono, monospace",
    };
    const rowDividerStyle = { "--chart-divider": colors.border } as CSSProperties;

    return (
        <div className="overflow-hidden rounded-md border bg-white" style={{ borderColor: colors.border }}>
            {toolbar && (
                <div
                    className="flex items-center justify-between px-4 pt-4"
                >
                    {toolbar}
                </div>
            )}

            {data.length === 0 ? (
                <div className="p-5">
                    {emptyState ?? (
                        <p className="body-md text-center py-8" style={{ color: colors.textMuted }}>
                            Ingen data tilgængelig
                        </p>
                    )}
                </div>
            ) : (
                <div className={chartClassName} style={{ ...rowDividerStyle, height }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={margin} barGap={barGap}>
                            <CartesianGrid stroke={colors.border} strokeDasharray="4 4" />
                            <XAxis
                                dataKey={xDataKey}
                                tickFormatter={xTickFormatter}
                                interval={xTickInterval}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                tick={tickStyle}
                            />
                            <YAxis
                                width={yAxisWidth}
                                allowDecimals={false}
                                tickLine={false}
                                axisLine={false}
                                tick={tickStyle}
                            />
                            <Tooltip
                                content={tooltipContent}
                                cursor={cursor}
                                isAnimationActive={false}
                                wrapperStyle={{ outline: "none", pointerEvents: "none" }}
                            />
                            {series.map(item => (
                                <Bar
                                    key={item.key}
                                    dataKey={item.key}
                                    name={item.name}
                                    fill={item.color}
                                    radius={[3, 3, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
