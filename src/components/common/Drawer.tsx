"use client";

import { colors } from "@/constants/colors";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type DrawerSide = "right" | "left";
type DrawerWidth = "md" | "lg" | "xl" | "full";

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    side?: DrawerSide;
    width?: DrawerWidth;
    className?: string;
}

const widthClasses: Record<DrawerWidth, string> = {
    md: "w-full sm:w-[520px]",
    lg: "w-full sm:w-[720px]",
    xl: "w-full sm:w-[1080px]",
    full: "w-full",
};

const sideClasses: Record<DrawerSide, { position: string; border: string; open: string; closed: string }> = {
    right: {
        position: "right-0",
        border: "border-l",
        open: "translate-x-0",
        closed: "translate-x-full",
    },
    left: {
        position: "left-0",
        border: "border-r",
        open: "translate-x-0",
        closed: "-translate-x-full",
    },
};

export default function Drawer({
    open,
    onClose,
    children,
    side = "right",
    width = "xl",
    className = "",
}: DrawerProps) {
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

    const placement = sideClasses[side];

    return createPortal(
        <div
            className={`fixed inset-0 z-50 transition-all duration-150 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        >
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-transparent transition-opacity duration-150 ${open ? "opacity-100" : "opacity-0"}`}
                aria-hidden="true"
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-hidden={!open}
                style={{
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    boxShadow: side === "right"
                        ? "-1px 0 2px rgba(140,149,159,0.05), -4px 0 12px rgba(140,149,159,0.1), -12px 0 32px rgba(140,149,159,0.15)"
                        : "1px 0 2px rgba(140,149,159,0.05), 4px 0 12px rgba(140,149,159,0.1), 12px 0 32px rgba(140,149,159,0.15)",
                }}
                className={`absolute top-0 h-full ${placement.position} ${widthClasses[width]} ${placement.border} ${open ? `${placement.open} transition-transform duration-150 ease-out` : `${placement.closed} transition-transform duration-100 ease-in`} ${className}`}
            >
                {children}
            </aside>
        </div>,
        document.body
    );
}
