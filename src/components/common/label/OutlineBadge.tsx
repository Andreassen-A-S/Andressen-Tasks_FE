"use client";

import { colors } from "@/constants/colors";
import FloatingTooltip from "@/components/common/tooltip/FloatingTooltip";

interface OutlineBadgeProps {
  label: string;
  tooltip?: string;
}

export default function OutlineBadge({ label, tooltip }: OutlineBadgeProps) {
  const badge = (
    <span
      className="px-1.5 py-0.5 rounded-full body-xs font-medium cursor-default"
      style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
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
