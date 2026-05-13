import { colors } from "@/constants/colors";
import type { ReactNode } from "react";

interface StatsPanelProps {
    title: string;
    subtitle?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    contentClassName?: string;
}

export default function StatsPanel({
    title,
    subtitle,
    action,
    children,
    contentClassName = "p-5",
}: StatsPanelProps) {
    return (
        <section
            className="overflow-hidden rounded-md border bg-surface"
            style={{ borderColor: colors.border }}
        >
            <div
                className="flex items-center justify-between px-4 py-2 border-b"
                style={{ borderColor: colors.border }}
            >
                <div>
                    <h3 className="h4">{title}</h3>
                    {subtitle && <p className="body-sm" style={{ color: colors.textMuted }}>{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className={contentClassName}>
                {children}
            </div>
        </section>
    );
}
