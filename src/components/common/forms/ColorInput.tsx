"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { colors } from "@/constants/colors";

type ColorInputSize = "sm" | "md";

interface ColorInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  inputSize?: ColorInputSize;
  fullWidth?: boolean;
}

const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(function ColorInput(
  {
    inputSize = "md",
    fullWidth = false,
    className = "",
    disabled,
    style,
    value = "#1B1D22",
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const sizeClasses = {
    sm: {
      wrapper: "h-7 px-3",
      swatch: "h-4 w-4 rounded-sm",
      text: "body-sm",
    },
    md: {
      wrapper: "h-8 px-3",
      swatch: "h-5 w-5 rounded",
      text: "body-sm",
    },
  } as const;
  const currentSize = sizeClasses[inputSize];
  const displayValue = typeof value === "string" ? value.toUpperCase() : "#1B1D22";

  return (
    <label
      className={[
        "flex items-center gap-3 rounded-md border transition-colors cursor-pointer",
        fullWidth ? "w-full" : "w-fit min-w-40",
        currentSize.wrapper,
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        borderColor: focused ? colors.blue : colors.border,
        backgroundColor: focused ? colors.white : colors.whiteHover,
        boxShadow: focused
          ? `inset 0 1px 0 rgba(208, 215, 222, 0.2), 0 0 0 3px ${colors.blueLight}`
          : "inset 0 1px 0 rgba(208, 215, 222, 0.2)",
        ...style,
      }}
    >
      <span
        className={`${currentSize.swatch} shrink-0 border`}
        style={{ backgroundColor: displayValue, borderColor: colors.border }}
      />
      <span className={`${currentSize.text} truncate`} style={{ color: colors.textPrimary }}>
        {displayValue}
      </span>
      <input
        ref={ref}
        type="color"
        disabled={disabled}
        value={displayValue}
        className="sr-only"
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
    </label>
  );
});

export default ColorInput;
