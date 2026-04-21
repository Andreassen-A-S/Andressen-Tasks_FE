"use client";

import { useState, useRef, useContext } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { colors } from "@/constants/colors";
import { DropdownOpenContext } from "@/components/common/DropdownMenu";
import type { CSSProperties } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: IconDefinition;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
  iconClassName?: string;
  fullWidth?: boolean;
  tooltip?: string;
}

const variantBaseStyle: Record<ButtonVariant, CSSProperties> = {
  primary: { backgroundColor: colors.green, color: colors.textWhite },
  secondary: { backgroundColor: colors.white, color: colors.textPrimary, border: `1px solid ${colors.border}` },
  danger:    { backgroundColor: colors.white, color: colors.red, border: `1px solid ${colors.red}` },
  ghost:     { backgroundColor: "transparent", color: colors.textSecondary },
};

const variantHoverBg: Record<ButtonVariant, string> = {
  primary:   colors.greenHover,
  secondary: colors.muted,
  danger:    colors.redLight,
  ghost:     colors.border,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 btn-sm rounded-md gap-1.5",
  md: "px-4 py-2 btn-md rounded-md gap-2",
  lg: "px-5 py-2.5 btn-lg rounded-lg gap-2",
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: "w-7 h-7 rounded-md",
  md: "w-8 h-8 rounded-md",
  lg: "w-10 h-10 rounded-lg",
};

export default function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  iconOnly = false,
  iconClassName,
  fullWidth = false,
  tooltip,
  disabled,
  className = "",
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const dropdownOpen = useContext(DropdownOpenContext);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function showTooltip() {
    if (!tooltip || dropdownOpen) return;
    const el = buttonRef.current ?? wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltipPos({ top: rect.bottom + 4, left: rect.left + rect.width / 2 });
  }

  function hideTooltip() {
    setTooltipPos(null);
  }

  const button = (
    <button
      ref={buttonRef}
      {...props}
      disabled={isDisabled}
      style={{ ...variantBaseStyle[variant], ...style }}
      className={[
        "inline-flex items-center justify-center transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0f6e56]",
        iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
        !iconOnly && fullWidth ? "w-full" : "",
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={(e) => {
        if (!isDisabled) e.currentTarget.style.backgroundColor = variantHoverBg[variant];
        if (!isDisabled) showTooltip();
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) e.currentTarget.style.backgroundColor = variantBaseStyle[variant].backgroundColor as string;
        hideTooltip();
        onMouseLeave?.(e);
      }}
      onClick={(e) => {
        hideTooltip();
        props.onClick?.(e);
      }}
    >
      {loading ? (
        <FontAwesomeIcon icon={faSpinner} spin className="text-current" />
      ) : (
        icon && iconPosition === "left" && (
          <FontAwesomeIcon icon={icon} className={iconClassName ?? "text-current w-4 h-4"} />
        )
      )}
      {children}
      {!loading && icon && iconPosition === "right" && (
        <FontAwesomeIcon icon={icon} className={iconClassName ?? "text-current w-4 h-4"} />
      )}
    </button>
  );

  const tooltipPortal = tooltipPos && typeof document !== "undefined" && createPortal(
    <div
      className="pointer-events-none fixed -translate-x-1/2 px-2 py-1 rounded-md whitespace-nowrap body-xs animate-in fade-in duration-150 z-[9999]"
      style={{ top: tooltipPos.top, left: tooltipPos.left, backgroundColor: colors.eggWhite, color: colors.textPrimary }}
    >
      {tooltip}
    </div>,
    document.body
  );

  if (!tooltip) return button;

  return (
    <>
      <div
        ref={wrapperRef}
        className={["relative inline-flex", !iconOnly && fullWidth ? "w-full" : ""].filter(Boolean).join(" ")}
        onMouseEnter={() => { if (isDisabled) showTooltip(); }}
        onMouseLeave={() => { if (isDisabled) hideTooltip(); }}
      >
        {button}
      </div>
      {tooltipPortal}
    </>
  );
}
