"use client";

import { colors } from "@/constants/colors";
import type { CSSProperties, ReactNode } from "react";

interface DataTableColumn {
    key: string;
    header: ReactNode;
    className?: string;
    style?: CSSProperties;
}

interface DataTableProps {
    columns: DataTableColumn[];
    children: ReactNode;
    toolbar?: ReactNode;
}

export default function DataTable({ columns, children, toolbar }: DataTableProps) {
    return (
        <div className="rounded-md border overflow-hidden bg-white" style={{ borderColor: colors.border }}>
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
                    <thead className="bg-white border-b" style={{ borderColor: colors.border }}>
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
                    <tbody>{children}</tbody>
                </table>
            </div>
        </div>
    );
}
