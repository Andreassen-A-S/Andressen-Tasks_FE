"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { colors } from "@/constants/colors";
import type { CSSProperties, ReactNode } from "react";

interface DataTableColumn {
    key: string;
    header: ReactNode;
    className?: string;
    style?: CSSProperties;
}

interface DataTableProps {
    columns?: DataTableColumn[];
    children: ReactNode;
    toolbar?: ReactNode;
    variant?: "columns" | "single";
}

interface RowGroupProps {
    label: ReactNode;
    colSpan: number;
    count?: number;
    defaultOpen?: boolean;
    children: ReactNode;
}

export function RowGroup({ label, colSpan, count, defaultOpen = true, children }: RowGroupProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <>
            <tr style={{ backgroundColor: colors.muted }}>
                <td colSpan={colSpan} className="p-0">
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-2 text-left select-none"
                        aria-expanded={isOpen}
                        onClick={() => setIsOpen((v) => !v)}
                    >
                        {isOpen
                            ? <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: colors.textMuted }} />
                            : <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: colors.textMuted }} />
                        }
                        <span className="label-lg" style={{ color: colors.textPrimary }}>{label}</span>
                        {count !== undefined && (
                            <span className="label-sm" style={{ color: colors.textMuted }}>{count} {count === 1 ? "række" : "rækker"}</span>
                        )}
                    </button>
                </td>
            </tr>
            {isOpen && children}
        </>
    );
}

export default function DataTable({ columns = [], children, toolbar, variant = "columns" }: DataTableProps) {
    const showHeader = variant === "columns" && columns.length > 0;
    const rowDividerStyle = { "--table-row-divider": colors.muted } as CSSProperties;

    return (
        <div className="rounded-md border overflow-hidden bg-surface" style={{ borderColor: colors.border }}>
            {toolbar && (
                <div
                    className="flex items-center justify-between px-4 py-2 border-b"
                    style={{ borderColor: colors.border }}
                >
                    {toolbar}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    {showHeader && (
                        <thead className="border-b" style={{ backgroundColor: colors.whiteHover, borderColor: colors.border }}>
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={column.className}
                                        style={{ color: colors.textMuted, ...column.style }}
                                    >
                                        {column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    <tbody className="[&>tr+tr]:border-t [&>tr+tr]:border-[var(--table-row-divider)]" style={rowDividerStyle}>
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
