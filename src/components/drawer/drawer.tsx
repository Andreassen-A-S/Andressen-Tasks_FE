"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Drawer({ open, onClose, children }: DrawerProps) {
    useEffect(() => {
        if (!open) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEsc);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", handleEsc);
        };
    }, [open, onClose]);

    if (typeof document === "undefined") return null;
    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50">
            {/* Invisible overlay (click outside closes, no blur/tint) */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-transparent"
                aria-hidden="true"
            />

            {/* Drawer Panel (enter animation only) */}
            <aside
                role="dialog"
                aria-modal="true"
                className="absolute right-0 top-0 h-full w-full sm:w-250 bg-white shadow-2xl animate-slide-in-right"
            >
                {children}
            </aside>
        </div>,
        document.body
    );
}
