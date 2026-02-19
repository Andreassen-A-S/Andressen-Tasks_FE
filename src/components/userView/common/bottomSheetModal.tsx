"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface BottomSheetModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function BottomSheetModal({ open, onClose, children }: BottomSheetModalProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const mountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (mountTimerRef.current) clearTimeout(mountTimerRef.current);
        if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);

        if (open) {
            setTimeout(() => setIsMounted(true), 0);
            mountTimerRef.current = setTimeout(() => setIsVisible(true), 10);
        } else {
            setTimeout(() => setIsVisible(false), 0);
            unmountTimerRef.current = setTimeout(() => setIsMounted(false), 200);
        }

        return () => {
            if (mountTimerRef.current) clearTimeout(mountTimerRef.current);
            if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [open, onClose]);

    if (typeof document === "undefined" || !isMounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50">
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-[#1B1D22]/50 transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
                aria-hidden="true"
            />
            <aside
                role="dialog"
                aria-modal="true"
                className={`absolute left-0 bottom-0 w-full max-w-107.5 sm:left-1/2 sm:-translate-x-1/2 bg-white rounded-t-[20px] border border-[#E8E6E1] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-transform duration-200 ${isVisible ? "translate-y-0" : "translate-y-full"}`}
            >
                {children}
            </aside>
        </div>,
        document.body
    );
}
