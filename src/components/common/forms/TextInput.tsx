"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { colors } from "@/constants/colors";
import { Eye, EyeOff } from "lucide-react";

type TextInputSize = "sm" | "md";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingVisual?: ReactNode;
  trailingVisual?: ReactNode;
  invalid?: boolean;
  inputSize?: TextInputSize;
  sensitive?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    leadingVisual,
    trailingVisual,
    invalid = false,
    inputSize = "md",
    sensitive = false,
    className = "",
    disabled,
    style,
    type,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [showSensitiveValue, setShowSensitiveValue] = useState(false);
  const hasLeading = Boolean(leadingVisual);
  const effectiveTrailingVisual = sensitive ? (
    <button
      type="button"
      aria-label={showSensitiveValue ? "Skjul indhold" : "Vis indhold"}
      onClick={() => setShowSensitiveValue((value) => !value)}
      className="flex items-center rounded-sm transition-colors -mr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ color: colors.textMuted }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {showSensitiveValue ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  ) : trailingVisual;
  const hasTrailing = Boolean(effectiveTrailingVisual);
  const sizeClasses = {
    sm: {
      wrapper: "h-7",  //52 px in browser
      input: "px-3 body-sm",
      leading: "px-3",
      trailing: "pr-3",
    },
    md: {
      wrapper: "h-8", //60px in browser
      input: "px-3 body-sm",
      leading: "pl-4",
      trailing: "pr-4",
    },
  } as const;
  const currentSize = sizeClasses[inputSize];

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
      <input
        ref={ref}
        disabled={disabled}
        type={sensitive ? (showSensitiveValue ? "text" : "password") : type}
        className={[
          "h-full w-full min-w-0 rounded-md border-0 bg-transparent ",
          "placeholder:text-[#9DA1B4]",
          "focus:outline-none focus:ring-0",
          currentSize.input,
          hasLeading ? "pl-2" : "",
          hasTrailing ? "pr-2" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          color: colors.textPrimary,
          ...style,
        }}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
      />
      {hasTrailing && (
        <div className={`flex shrink-0 items-center ${currentSize.trailing}`} style={{ color: colors.textMuted }}>
          {effectiveTrailingVisual}
        </div>
      )}
    </div>
  );
});

export default TextInput;
