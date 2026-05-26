"use client";

import { colors } from "@/constants/colors";
import FloatingTooltip from "@/components/common/tooltip/FloatingTooltip";

interface OutlineBadgeProps {
  label: string;
  tooltip?: string;
  variant?: "neutral" | "accent";
}

export default function OutlineBadge({ label, tooltip, variant = "neutral" }: OutlineBadgeProps) {
  const badge = (
    <span
      className={`inline-flex h-5 shrink-0 items-center rounded-full border px-2 body-xs font-medium cursor-default ${variant === "accent" ? "border-accent/30 bg-accent-surface" : "border-border"}`}
      style={{
        backgroundColor: variant === "accent" ? undefined : colors.whiteHover,
        color: colors.textSecondary,
      }}
    >
      {label}
    </span>
  );

  if (!tooltip) return badge;

  return (
    <FloatingTooltip
      content={tooltip}
      placement="top"
      variant="bare"
    >
      {badge}
    </FloatingTooltip>
  );
}
