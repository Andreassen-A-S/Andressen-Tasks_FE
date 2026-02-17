"use client";

import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import CloseButton from "../common/buttons/CloseButton";

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
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
        "3xl": "sm:max-w-3xl",
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-50 overflow-y-scroll"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
            >
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/40 transition-opacity"
                    onClick={handleBackdropClick}
                    aria-hidden="true"
                ></div>

                {/* Modal panel */}
                <div className={`relative transform overflow-hidden rounded-lg bg-white text-left transition-all sm:my-8 sm:w-full border border-[#E8E6E1] ${maxWidthClasses[maxWidth]}`}>
                    {/* Modal header */}
                    <div className="px-6 pb-4 pt-6 sm:p-8]">
                        <div className="flex items-center justify-between mb-4">
                            <h3
                                className="h3"
                                id="modal-title"
                            >
                                {title}
                            </h3>
                            <CloseButton onClick={onClose} />
                        </div>
                        {/* Modal content */}
                        <div>
                            {children}
                        </div>
                    </div>
                    {/* Modal footer (optional) */}
                    {footer && (
                        <div className="bg-[#FAFAF7] px-6 py-4 sm:px-8 border-t border-[#E8E6E1]">
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