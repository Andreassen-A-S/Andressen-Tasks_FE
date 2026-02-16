"use client";

import React from "react";

interface TooltipProps {
    children: React.ReactNode;
    className?: string;
}

export default function Tooltip({ children, className = "" }: TooltipProps) {
    return (
        <div className={`absolute left-0 top-full mt-2 z-50 w-64 rounded-lg bg-gray-50 px-3 py-2 label-sm border border-gray-200 ${className}`}>
            <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-gray-50 border-t border-l border-gray-200"></div>
            {children}
        </div>
    );
}