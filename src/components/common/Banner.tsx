"use client";

import { CheckCircle2, GitBranch, Info, TriangleAlert, X } from "lucide-react";
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
    icon?: ReactNode;
    role?: string;
}

const variantClasses: Record<BannerVariant, { container: string; icon: string; iconNode: ReactNode }> = {
    default: {
        container: "border-border bg-surface-hover text-text-primary",
        icon: "text-text-muted",
        iconNode: <GitBranch className="w-5 h-5" />,
    },
    info: {
        container: "border-link bg-info-surface text-text-primary",
        icon: "text-link",
        iconNode: <Info className="w-5 h-5" />,
    },
    success: {
        container: "border-accent-mid bg-accent-surface text-text-primary",
        icon: "text-accent",
        iconNode: <CheckCircle2 className="w-5 h-5" />,
    },
    warning: {
        container: "border-[var(--warning-border)] bg-warning-surface text-text-primary",
        icon: "text-warning",
        iconNode: <TriangleAlert className="w-5 h-5" />,
    },
    danger: {
        container: "border-danger bg-danger-surface text-text-primary",
        icon: "text-danger",
        iconNode: <TriangleAlert className="w-5 h-5" />,
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
    icon,
    role,
}: BannerProps) {
    const Component = as;
    const styles = variantClasses[variant];
    const body = description ?? children;
    const headingId = id && title ? `${id}-title` : undefined;
    const resolvedRole = role ?? (variant === "warning" || variant === "danger" ? "alert" : undefined);

    return (
        <Component
            id={id}
            role={resolvedRole}
            aria-labelledby={headingId}
            className={[
                "rounded-lg border px-5 py-2.5",
                styles.container,
                className,
            ].filter(Boolean).join(" ")}
        >
            <div className="flex items-center gap-4">
                <span className={`shrink-0 ${styles.icon}`} aria-hidden="true">
                    {icon ?? styles.iconNode}
                </span>
                <div className="min-w-0 flex-1">
                    {title && (
                        <p id={headingId} className="h5">
                            {title}
                        </p>
                    )}
                    {body && (
                        <div className="body-sm">
                            {body}
                        </div>
                    )}
                </div>
                {action && <div className="-mr-2 shrink-0">{action}</div>}
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
