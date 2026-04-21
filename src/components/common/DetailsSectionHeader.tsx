"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { colors } from "@/constants/colors";

interface Props {
  label: string;
  onGearClick: (button: HTMLButtonElement) => void;
  onClose?: () => void;
  isOpen?: boolean;
  children?: React.ReactNode;
  emptyText?: string;
  disabled?: boolean;
}

export default function DetailsSectionHeader({ label, onGearClick, onClose, isOpen, children, emptyText, disabled = false }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (isOpen) {
      onClose?.();
      return;
    }
    onGearClick(e.currentTarget);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`flex items-center justify-between mb-2 py-1.5 rounded-md transition-colors ${disabled ? "cursor-default" : "cursor-pointer"}`}
        style={{
          width: "calc(100% + 16px)",
          marginLeft: "-8px",
          marginRight: "-8px",
          paddingLeft: "8px",
          paddingRight: "8px",
          backgroundColor: isOpen ? colors.muted : "transparent",
          opacity: disabled ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (disabled) return;
          e.currentTarget.style.backgroundColor = isOpen ? colors.border : colors.muted;
        }}
        onMouseLeave={(e) => {
          if (disabled) return;
          e.currentTarget.style.backgroundColor = isOpen ? colors.muted : "transparent";
        }}
      >
        <h3
          className="label-md"
        // style={{ color: colors.textSecondary, fontWeight: 600, fontSize: "0.75rem" }}
        >
          {label}
        </h3>
        {!disabled && (
          <FontAwesomeIcon icon={faGear} style={{ fontSize: "0.6875rem", color: colors.textMuted }} />
        )}
      </button>
      {children ?? (emptyText && (
        <span className="body-xs" style={{ color: colors.textMuted }}>{emptyText}</span>
      ))}
    </div>
  );
}
