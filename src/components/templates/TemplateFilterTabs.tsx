"use client";

import { colors } from "@/constants/colors";

export type TemplateFilter = "all" | "active" | "inactive";

interface TemplateFilterTabsProps {
    activeFilter: TemplateFilter;
    options: { key: TemplateFilter; label: string; count: number }[];
    onFilterChange: (filter: TemplateFilter) => void;
}

export default function TemplateFilterTabs({
    activeFilter,
    options,
    onFilterChange,
}: TemplateFilterTabsProps) {
    return (
        <div className="flex gap-2 border-b border-gray-200">
            {options.map(({ key, label, count }) => (
                <button
                    key={key}
                    onClick={() => onFilterChange(key)}
                    className={`label-lg px-4 py-2 transition-colors border-b-2 ${activeFilter === key
                        ? "border-blue-600"
                        : "border-transparent hover:text-green-200"
                        }`}
                    style={activeFilter === key ? undefined : { color: colors.textSecondary }}
                >
                    {label} ({count})
                </button>
            ))}
        </div>
    );
}
