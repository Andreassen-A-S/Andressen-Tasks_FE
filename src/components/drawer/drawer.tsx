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

    return createPortal(
        <div
            className={`fixed inset-0 z-50 transition-all duration-150 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        >
            {/* Overlay */}
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-transparent transition-opacity duration-150 ${open ? "opacity-100" : "opacity-0"}`}
                aria-hidden="true"
            />

            {/* Drawer panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-hidden={!open}
                style={{ boxShadow: "-1px 0 2px rgba(140,149,159,0.05), -4px 0 12px rgba(140,149,159,0.1), -12px 0 32px rgba(140,149,159,0.15)" }}
                className={`absolute right-0 top-0 h-full w-full sm:w-250 bg-white border-l border-[#E8E6E1] ${open ? "translate-x-0 transition-transform duration-150 ease-out" : "translate-x-full transition-transform duration-100 ease-in"}`}
            >
                {children}
            </aside>
        </div>,
        document.body
    );
}
