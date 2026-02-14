"use client";

import { ButtonHTMLAttributes } from "react";

interface EditButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    onClick: () => void;
    label?: string;
    ariaLabel?: string;
    size?: "sm" | "md" | "lg";
    variant?: "primary" | "secondary";
    loading?: boolean;
}

export default function EditButton({
    onClick,
    label = "Rediger",
    ariaLabel,
    size = "md",
    variant = "primary",
    loading = false,
    className = "",
    disabled,
    ...props
}: EditButtonProps) {
    const sizeClasses = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base"
    };

    const variantClasses = {
        primary:
            "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 focus:ring-indigo-500",

        secondary: "text-gray-600 hover:text-gray-800 focus:ring-gray-500"
    };

    const baseClasses = `
        font-medium transition-colors 
        focus:outline-none focus:ring-2 focus:ring-offset-1 rounded
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const combinedClasses = `
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${className}
    `.trim();

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel || `${label} opgave`}
            className={combinedClasses}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    Indlæser...
                </div>
            ) : (
                label
            )}
        </button>
    );
}