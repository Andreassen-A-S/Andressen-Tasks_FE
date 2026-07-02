"use client";

import { useContext } from "react";
import { Loader2 } from "lucide-react";
import { colors } from "@/constants/colors";
import { DropdownOpenContext } from "@/components/common/DropdownMenu";
import type { CSSProperties } from "react";
import FloatingTooltip from "@/components/common/tooltip/FloatingTooltip";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
  fullWidth?: boolean;
  tooltip?: string;
  kbd?: React.ReactNode;
}

const variantBaseStyle: Record<ButtonVariant, CSSProperties> = {
  primary: { backgroundColor: colors.green, color: colors.textWhite },
  secondary: { backgroundColor: colors.white, color: colors.textPrimary, border: `1px solid ${colors.border}` },
  danger: { backgroundColor: colors.white, color: colors.red, border: `1px solid ${colors.red}` },
  ghost: { backgroundColor: "transparent", color: colors.textSecondary },
};

const variantHoverBg: Record<ButtonVariant, string> = {
  primary: colors.greenHover,
  secondary: colors.muted,
  danger: colors.redLight,
  // Opacity-based (not a fixed token) so ghost buttons stay legible on any
  // surface color they're placed on, e.g. bg-accent-surface vs bg-surface.
  ghost: "color-mix(in srgb, currentColor 8%, transparent)",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-3 btn-sm rounded-md gap-1.5",
  md: "h-8 px-3 btn-md rounded-md gap-2",
  lg: "h-10 px-4 btn-lg rounded-lg gap-2",
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
  fullWidth = false,
  tooltip,
  kbd,
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

  const resolvedVariantStyle: CSSProperties =
    variant === "ghost" && dropdownOpen
      ? { ...variantBaseStyle[variant], backgroundColor: "color-mix(in srgb, currentColor 10%, transparent)" }
      : variantBaseStyle[variant];
  const resolvedHoverBg =
    variant === "ghost" && dropdownOpen
      ? "color-mix(in srgb, currentColor 16%, transparent)"
      : variantHoverBg[variant];

  const button = (
    <button
      {...props}
      disabled={isDisabled}
      style={{ ...resolvedVariantStyle, ...style }}
      className={[
        "inline-flex shrink-0 items-center justify-center transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-accent",
        iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
        !iconOnly && fullWidth ? "w-full" : "",
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={(e) => {
        if (!isDisabled) e.currentTarget.style.backgroundColor = resolvedHoverBg;
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) e.currentTarget.style.backgroundColor = resolvedVariantStyle.backgroundColor as string;
        if (!isDisabled) e.currentTarget.style.color = resolvedVariantStyle.color as string;
        onMouseLeave?.(e);
      }}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && iconPosition === "left" && icon
      )}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
      {!loading && kbd && (
        <span
          className="inline-flex items-center justify-center rounded"
          style={{
            backgroundColor: "rgba(0,0,0,0.15)",
            padding: "2px 4px",
            marginRight: "-4px",
          }}
        >
          {kbd}
        </span>
      )}
    </button>
  );

  if (!tooltip) return button;

  return (
    <FloatingTooltip
      content={tooltip}
      placement="top"
      variant="bare"
      disabled={dropdownOpen}
      triggerClassName={!iconOnly && fullWidth ? "w-full" : ""}
    >
      <span className={["inline-flex", !iconOnly && fullWidth ? "w-full" : ""].filter(Boolean).join(" ")}>
        {button}
      </span>
    </FloatingTooltip>
  );
}
