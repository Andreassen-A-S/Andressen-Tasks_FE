"use client";
import { useState } from "react";
import Tooltip from "../common/tooltip/Tooltip";

interface StatCardProps {
    title: string;
    value: number | string;
    icon?: React.ReactNode;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    variant?: "default" | "success" | "warning" | "danger";
    subtitle?: string;
    tooltip?: string; // Add this
}

export default function StatCard({
    title,
    value,
    icon,
    trend,
    trendValue,
    variant = "default",
    subtitle,
    tooltip,
}: StatCardProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    const variantStyles = {
        default: "bg-white border-gray-200",
        success: "bg-green-50 border-green-200",
        warning: "bg-yellow-50 border-yellow-200",
        danger: "bg-red-50 border-red-200",
    };

    const textColors = {
        default: "text-gray-900",
        success: "text-green-900",
        warning: "text-yellow-900",
        danger: "text-red-900",
    };

    const subtitleColors = {
        default: "text-gray-500",
        success: "text-green-600",
        warning: "text-yellow-600",
        danger: "text-red-600",
    };

    const trendColors = {
        up: "text-green-600",
        down: "text-red-600",
        neutral: "text-gray-600",
    };

    const trendIcons = {
        up: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        ),
        down: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        ),
        neutral: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
        ),
    };

    return (
        <div className={`rounded-lg border p-6 transition-all ${variantStyles[variant]}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className={`h4 ${subtitleColors[variant]}`}>{title}</p>
                        {tooltip && (
                            <div className="relative">
                                <button
                                    type="button"
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="More information"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </button>
                                {showTooltip && (
                                    <Tooltip>
                                        {tooltip}
                                    </Tooltip>
                                )}
                            </div>
                        )}
                    </div>
                    <p className={`mt-2 h1 ${textColors[variant]}`}>{value}</p>
                    {subtitle && (
                        <p className={`mt-1 label-lg ${subtitleColors[variant]}`}>{subtitle}</p>
                    )}
                    {trend && trendValue && (
                        <div className={`mt-2 flex items-center gap-1 label-md ${trendColors[trend]}`}>
                            {trendIcons[trend]}
                            <span className="font-medium">{trendValue}</span>
                        </div>
                    )}
                </div>
                {icon && <div className={`rounded-lg p-3 ${subtitleColors[variant]}`}>{icon}</div>}
            </div>
        </div>
    );
}
