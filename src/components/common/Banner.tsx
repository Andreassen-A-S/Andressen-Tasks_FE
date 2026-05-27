"use client";

import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";
import Button from "@/components/common/buttons/Button";

type BannerVariant = "default" | "info" | "success" | "warning" | "danger";

interface BannerProps {
    variant?: BannerVariant;
    title?: ReactNode;
    children?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    onDismiss?: () => void;
    dismissLabel?: string;
    className?: string;
    id?: string;
    as?: "div" | "section";
}

const variantClasses: Record<BannerVariant, { container: string; icon: string; iconNode: ReactNode }> = {
    default: {
        container: "border-border bg-surface-subtle text-text-primary",
        icon: "text-text-muted",
        iconNode: <Info className="w-4 h-4" />,
    },
    info: {
        container: "border-link bg-info-surface text-text-primary",
        icon: "text-link",
        iconNode: <Info className="w-4 h-4" />,
    },
    success: {
        container: "border-accent-mid bg-accent-surface text-text-primary",
        icon: "text-accent",
        iconNode: <CheckCircle2 className="w-4 h-4" />,
    },
    warning: {
        container: "border-warning bg-warning-surface text-text-primary",
        icon: "text-warning",
        iconNode: <TriangleAlert className="w-4 h-4" />,
    },
    danger: {
        container: "border-danger bg-danger-surface text-text-primary",
        icon: "text-danger",
        iconNode: <TriangleAlert className="w-4 h-4" />,
    },
};

export default function Banner({
    variant = "default",
    title,
    children,
    description,
    action,
    onDismiss,
    dismissLabel = "Luk besked",
    className = "",
    id,
    as = "div",
}: BannerProps) {
    const Component = as;
    const styles = variantClasses[variant];
    const body = description ?? children;
    const headingId = id && title ? `${id}-title` : undefined;

    return (
        <Component
            id={id}
            aria-labelledby={headingId}
            className={[
                "rounded-lg border px-4 py-3",
                styles.container,
                className,
            ].filter(Boolean).join(" ")}
        >
            <div className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 ${styles.icon}`} aria-hidden="true">
                    {styles.iconNode}
                </span>
                <div className="min-w-0 flex-1">
                    {title && (
                        <p id={headingId} className="label-lg">
                            {title}
                        </p>
                    )}
                    {body && (
                        <div className={`${title ? "mt-1" : ""} body-sm`}>
                            {body}
                        </div>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
                {onDismiss && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={<X className="w-4 h-4" />}
                        iconOnly
                        aria-label={dismissLabel}
                        tooltip={dismissLabel}
                        onClick={onDismiss}
                    />
                )}
            </div>
        </Component>
    );
}
