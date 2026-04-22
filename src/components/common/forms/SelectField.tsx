"use client";

import { forwardRef, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import { colors } from "@/constants/colors";

type SelectFieldSize = "sm" | "md";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  inputSize?: SelectFieldSize;
  invalid?: boolean;
  leadingVisual?: ReactNode;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  {
    inputSize = "md",
    invalid = false,
    leadingVisual,
    className = "",
    disabled,
    children,
    style,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const sizeClasses = {
    sm: {
      wrapper: "h-7",
      select: "px-3 body-sm",
      leading: "pl-3",
    },
    md: {
      wrapper: "h-8",
      select: "pl-3 body-sm",
      leading: "pl-4",
    },
  } as const;

  const currentSize = sizeClasses[inputSize];
  const hasLeading = Boolean(leadingVisual);

  return (
    <div
      className={[
        "flex w-full items-center rounded-md border transition-colors",
        currentSize.wrapper,
        disabled ? "opacity-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        borderColor: invalid ? colors.red : focused ? colors.blue : colors.border,
        backgroundColor: focused ? colors.white : colors.whiteHover,
        boxShadow: invalid
          ? `inset 0 1px 0 rgba(208, 215, 222, 0.2), 0 0 0 3px ${colors.redLight}`
          : focused
            ? `inset 0 1px 0 rgba(208, 215, 222, 0.2), 0 0 0 3px ${colors.blueLight}`
            : "inset 0 1px 0 rgba(208, 215, 222, 0.2)",
      }}
    >
      {hasLeading && (
        <div className={`flex shrink-0 items-center ${currentSize.leading}`} style={{ color: colors.textMuted }}>
          {leadingVisual}
        </div>
      )}
      <select
        ref={ref}
        disabled={disabled}
        className={[
          "h-full w-full min-w-0 rounded-md border-0 bg-transparent pr-10 focus:outline-none focus:ring-0",
          currentSize.select,
          hasLeading ? "pl-2" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          color: colors.textPrimary,
          ...style,
        }}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});

export default SelectField;
