"use client";

import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import Button from "../common/buttons/Button";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { colors } from "@/constants/colors";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string | ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = "lg"
}: ModalProps) {
    // Handle escape key to close modal
    useEffect(() => {
        if (!isOpen) return;

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open AND prevent layout shift
    useEffect(() => {
        if (isOpen) {
            // Calculate scrollbar width
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            // Set CSS variable for scrollbar width
            document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);

            // Add data attribute to body (triggers CSS rules in globals.css)
            document.body.setAttribute('data-scroll-locked', 'true');
        } else {
            // Clean up
            document.body.removeAttribute('data-scroll-locked');
            document.documentElement.style.removeProperty('--scrollbar-width');
        }

        return () => {
            document.body.removeAttribute('data-scroll-locked');
            document.documentElement.style.removeProperty('--scrollbar-width');
        };
    }, [isOpen]);

    if (!isOpen) return null;

    function handleBackdropClick(e: React.MouseEvent) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    const maxWidthClasses = {
        sm: "sm:max-w-md",
        md: "sm:max-w-lg",
        lg: "sm:max-w-xl",
        xl: "sm:max-w-2xl",
        "2xl": "sm:max-w-3xl",
        "3xl": "sm:max-w-4xl",
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-[200] overflow-y-scroll"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-6"
            >
                <div
                    className="fixed inset-0 bg-black/30"
                    onClick={handleBackdropClick}
                    aria-hidden="true"
                ></div>

                <div
                    className={`relative w-full overflow-hidden rounded-xl border text-left ${maxWidthClasses[maxWidth]}`}
                    style={{ borderColor: colors.border, backgroundColor: colors.white }}
                >
                    <div className="flex items-center justify-between gap-4 border-b px-4 py-3" style={{ borderColor: colors.border }}>
                        <span className={"h5"} id="modal-title">
                            {title}
                        </span>
                        <Button variant="ghost" size="md" icon={faXmark} iconOnly onClick={onClose} tooltip="Luk panel" className="-mr-1" aria-label="Luk" />
                    </div>
                    <div className={"p-4"}>
                        {children}
                    </div>
                    {footer && (
                        <div
                            className={"border-t px-4 py-4"}
                            style={{ borderColor: colors.border }}
                        >
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );

    if (typeof document === "undefined") return null;
    return createPortal(modalContent, document.body);
}
