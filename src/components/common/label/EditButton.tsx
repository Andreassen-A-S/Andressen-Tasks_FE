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
        sm: "px-3 py-1 text-xs btn-sm",
        md: "px-4 py-2 text-sm btn-md",
        lg: "px-5 py-2.5 text-base btn-lg"
    };

    const variantClasses = {
        primary:
            "bg-link text-white hover:bg-link-hover focus:ring-link border-none",
        secondary:
            "bg-surface border border-border text-text-primary hover:bg-surface-page focus:ring-border"
    };

    const baseClasses = `
        font-semibold rounded-[8px] transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-sm
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
                    <span className="btn-md">Indlæser...</span>
                </div>
            ) : (
                <span className="btn-md">{label}</span>
            )}
        </button>
    );
}