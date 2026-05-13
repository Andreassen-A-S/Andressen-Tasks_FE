"use client";

import { colors } from "@/constants/colors";
import type { ReactNode } from "react";

interface FilterBarProps {
    left?: ReactNode;
    right?: ReactNode;
}

export default function FilterBar({ left, right }: FilterBarProps) {
    return (
        <div
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-md border bg-surface"
            style={{ borderColor: colors.border }}
        >
            <div className="flex flex-wrap items-center gap-1">{left}</div>
            {right && <div className="flex items-center gap-1">{right}</div>}
        </div>
    );
}
