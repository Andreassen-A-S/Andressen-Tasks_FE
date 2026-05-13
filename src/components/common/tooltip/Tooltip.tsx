"use client";

import React from "react";

interface TooltipProps {
    children: React.ReactNode;
    className?: string;
}

export default function Tooltip({ children, className = "" }: TooltipProps) {
    return (
        <div className={`absolute left-0 top-full mt-2 z-50 w-64 rounded-lg bg-surface-hover px-3 py-2 label-sm border border-border ${className}`}>
            <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-surface-hover border-t border-l border-border"></div>
            {children}
        </div>
    );
}
