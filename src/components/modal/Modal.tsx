"use client";

import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import CloseButton from "../common/buttons/CloseButton";
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
        sm: "sm:max-w-xs",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
        "3xl": "sm:max-w-3xl",
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-[200] overflow-y-scroll"
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
                <div className={`relative transform overflow-hidden rounded-lg text-left transition-all sm:my-8 sm:w-full border ${maxWidthClasses[maxWidth]}`} style={{ borderColor: colors.border, backgroundColor: colors.white }}>
                    {maxWidth === "sm" ? (
                        <>
                            <div className="flex items-center justify-between border-b p-3" style={{ borderColor: colors.border }}>
                                <h3 className="h5" id="modal-title">{title}</h3>
                                <CloseButton onClick={onClose} className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg w-9 h-9 -mr-1 -my-1 transition-all" />
                            </div>
                            <div className="p-3">{children}</div>
                            {footer && (
                                <div className="bg-[#FAFAF7] border-t p-3" style={{ borderColor: colors.border }}>{footer}</div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="px-6 pb-4 pt-6 sm:p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="h3" id="modal-title">{title}</h3>
                                    <CloseButton onClick={onClose} />
                                </div>
                                <div>{children}</div>
                            </div>
                            {footer && (
                                <div className=" px-6 py-4 sm:px-8 border-t" style={{ borderColor: colors.border, backgroundColor: colors.eggWhite }}>
                                    {footer}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div >
    );

    if (typeof document === "undefined") return null;
    return createPortal(modalContent, document.body);
}