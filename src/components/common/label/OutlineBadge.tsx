"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { colors } from "@/constants/colors";

interface OutlineBadgeProps {
  label: string;
  tooltip?: string;
}

export default function OutlineBadge({ label, tooltip }: OutlineBadgeProps) {
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  function handleMouseEnter() {
    if (!tooltip || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setTooltipPos({ top: rect.top - 4, left: rect.left + rect.width / 2 });
  }

  function handleMouseLeave() {
    setTooltipPos(null);
  }

  return (
    <>
      <span
        ref={ref}
        className="px-1.5 py-0.5 rounded-full body-xs font-medium cursor-default"
        style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {label}
      </span>
      {tooltipPos && typeof document !== "undefined" && createPortal(
        <div
          className="pointer-events-none fixed -translate-x-1/2 -translate-y-full px-2 py-1 rounded-md whitespace-nowrap body-xs animate-in fade-in duration-150 z-[9999]"
          style={{ top: tooltipPos.top, left: tooltipPos.left, backgroundColor: colors.charcoal, color: colors.textWhite }}
        >
          {tooltip}
        </div>,
        document.body
      )}
    </>
  );
}
