"use client";

import { colors } from "@/constants/colors";

export type PillColor = "green" | "yellow" | "red" | "blue" | "muted" | "default" | "gray";
type PillSize = "sm" | "md" | "lg";

interface PillProps {
    children: React.ReactNode;
    color?: PillColor;
    size?: PillSize;
    bordered?: boolean;
    className?: string;
}

const colorStyles: Record<PillColor, React.CSSProperties> = {
    green: { backgroundColor: colors.greenLight, color: colors.green, borderColor: colors.greenMid },
    yellow: { backgroundColor: colors.yellowLight, color: colors.yellow, borderColor: colors.yellowBorder },
    red: { backgroundColor: colors.redLight, color: colors.redText, borderColor: colors.redBorder },
    blue: { backgroundColor: colors.blueLight, color: colors.blue, borderColor: colors.blueHover },
    muted: { backgroundColor: colors.muted, color: colors.textSecondary, borderColor: colors.border },
    default: { backgroundColor: colors.white, color: colors.textSecondary, borderColor: colors.border },
    gray: { backgroundColor: "rgba(0,0,0,0.08)", color: colors.textSecondary, borderColor: "rgba(0,0,0,0.08)" },
};

const sizeClasses: Record<PillSize, string> = {
    sm: "mono-xs px-2 py-0.5",
    md: "label-sm inline-flex h-6 items-center px-2",
    lg: "label-md inline-flex h-7 items-center px-2",
};

export default function Pill({ children, color = "muted", size = "md", bordered = false, className }: PillProps) {
    const style = colorStyles[color];
    const borderStyle = bordered ? { border: `1px solid ${style.borderColor}` } : {};

    return (
        <span
            className={`rounded-full whitespace-nowrap ${sizeClasses[size]}${className ? ` ${className}` : ""}`}
            style={{ ...style, ...borderStyle }}
        >
            {children}
        </span>
    );
}
