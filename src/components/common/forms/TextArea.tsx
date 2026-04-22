"use client";

import { forwardRef, useState, type ReactNode, type TextareaHTMLAttributes } from "react";
import { colors } from "@/constants/colors";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  leadingVisual?: ReactNode;
  trailingVisual?: ReactNode;
  invalid?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    leadingVisual,
    trailingVisual,
    invalid = false,
    className = "",
    disabled,
    style,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const hasLeading = Boolean(leadingVisual);
  const hasTrailing = Boolean(trailingVisual);

  return (
    <div
      className={[
        "flex w-full rounded-md border transition-colors",
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
        <div className="flex shrink-0 items-start px-3 pt-3" style={{ color: colors.textMuted }}>
          {leadingVisual}
        </div>
      )}
      <textarea
        ref={ref}
        disabled={disabled}
        className={[
          "min-h-[104px] w-full min-w-0 resize-y rounded-md border-0 bg-transparent px-3 py-3 body-sm",
          "placeholder:text-[#9DA1B4]",
          "focus:outline-none focus:ring-0",
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
      {hasTrailing && (
        <div className="flex shrink-0 items-start pr-3 pt-3" style={{ color: colors.textMuted }}>
          {trailingVisual}
        </div>
      )}
    </div>
  );
});

export default TextArea;
