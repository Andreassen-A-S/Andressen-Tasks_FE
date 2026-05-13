"use client";

import {
    autoUpdate,
    flip,
    offset,
    shift,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
    useRole,
    FloatingPortal,
    type Placement,
} from "@floating-ui/react";
import { useState, type ReactNode } from "react";
import { colors } from "@/constants/colors";

type TooltipVariant = "default" | "bare" | "card";

interface FloatingTooltipProps {
    content: ReactNode;
    children: ReactNode;
    className?: string;
    triggerClassName?: string;
    placement?: Placement;
    offsetPx?: number;
    variant?: TooltipVariant;
    disabled?: boolean;
}

export default function FloatingTooltip({
    content,
    children,
    className = "",
    triggerClassName = "",
    placement = "bottom",
    offsetPx = 4,
    variant = "bare",
    disabled = false,
}: FloatingTooltipProps) {
    const [open, setOpen] = useState(false);
    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpen,
        placement,
        whileElementsMounted: autoUpdate,
        middleware: [offset(offsetPx), flip(), shift({ padding: 8 })],
    });
    const { setReference, setFloating } = refs;

    const hover = useHover(context, { move: false, enabled: !disabled });
    const focus = useFocus(context, { enabled: !disabled });
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "tooltip" });
    const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

    return (
        <>
            <span
                ref={setReference}
                {...getReferenceProps()}
                className={["inline-flex", triggerClassName].filter(Boolean).join(" ")}
            >
                {children}
            </span>
            {open && !disabled && (
                <FloatingPortal>
                    <div
                        ref={setFloating}
                        style={{ ...floatingStyles, ...getTooltipStyle(variant) }}
                        {...getFloatingProps()}
                        className={getTooltipClassName(variant, className)}
                    >
                        {variant === "default" && (
                            <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-surface-hover border-t border-l border-border" />
                        )}
                        {content}
                    </div>
                </FloatingPortal>
            )}
        </>
    );
}

function getTooltipClassName(variant: TooltipVariant, className: string) {
    const base = "z-[9999] fade-in";

    if (variant === "default") {
        return `${base} w-64 max-w-xs rounded-lg bg-surface-hover px-3 py-2 label-sm border border-border ${className}`.trim();
    }

    if (variant === "card") {
        return `${base} max-w-xs rounded-lg border p-3 ${className}`.trim();
    }

    return `${base} max-w-xs rounded-md px-2 py-1 body-xs pointer-events-none break-words ${className}`.trim();
}

function getTooltipStyle(variant: TooltipVariant) {
    if (variant === "card") {
        return {
            backgroundColor: colors.white,
            color: colors.textPrimary,
            borderColor: colors.border,
        };
    }

    if (variant === "bare") {
        return {
            backgroundColor: "var(--tooltip-bg)",
            color: "var(--tooltip-text)",
        };
    }

    return undefined;
}
