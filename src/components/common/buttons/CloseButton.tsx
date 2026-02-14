import React from "react";

interface CloseButtonProps {
    onClick: () => void;
    className?: string;
    ariaLabel?: string;
}

export default function CloseButton({
    onClick,
    className = "rounded-lg bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
    ariaLabel = "Close",
}: CloseButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
            aria-label={ariaLabel}
        >
            <span className="sr-only">{ariaLabel}</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    );
}