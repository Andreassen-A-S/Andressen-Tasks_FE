"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface BottomSheetModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function BottomSheetModal({ open, onClose, children }: BottomSheetModalProps) {
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
            {/* Overlay (click outside closes, no blur/tint) */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/10 transition-opacity"
                aria-hidden="true"
            />

            {/* Bottom Sheet Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                className="absolute left-0 bottom-0 w-full sm:max-w-md sm:left-1/2 sm:-translate-x-1/2 bg-white border-t border-[#E8E6E1] rounded-t-2xl shadow-xl animate-slide-in-bottom"
            >
                {children}
            </aside>
        </div>,
        document.body
    );
}