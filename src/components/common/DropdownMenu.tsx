"use client";

import { useEffect, useRef, useState, createContext } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { colors } from "@/constants/colors";

export const DropdownOpenContext = createContext(false);

export interface DropdownMenuItem {
  label: string;
  icon?: IconDefinition;
  onClick: () => void;
  danger?: boolean;
  dividerBefore?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
}

interface MenuPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export default function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function handleOpen() {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedHeight = items.length * 44 + 8;
    const estimatedWidth = 160;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

    const spaceRight = window.innerWidth - rect.left;
    const alignRight = spaceRight < estimatedWidth;

    const vertical = openUpward
      ? { bottom: window.innerHeight - rect.top + 4 }
      : { top: rect.bottom + 4 };

    const horizontal = alignRight
      ? { right: window.innerWidth - rect.right }
      : { left: rect.left };

    setPosition({ ...vertical, ...horizontal });
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;

    function handleClose() { setOpen(false); }

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideTrigger && !insideMenu) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [open]);

  return (
    <>
      <DropdownOpenContext.Provider value={open}>
        <div ref={triggerRef} onClick={handleOpen} className="cursor-pointer inline-flex">
          {trigger}
        </div>
      </DropdownOpenContext.Provider>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] min-w-[160px] rounded-lg animate-in fade-in zoom-in-95 duration-100 ease-out py-1.5"
          style={{
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.white,
            top: position.top,
            bottom: position.bottom,
            left: position.left,
            right: position.right,
          }}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.dividerBefore && (
                <div className="my-1.5" style={{ borderTop: `1px solid ${colors.border}` }} />
              )}
              <div className="px-1.5">
                <button
                  type="button"
                  onClick={() => { setOpen(false); item.onClick(); }}
                  className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md body-sm text-left transition-colors"
                  style={{
                    color: item.danger ? colors.red : colors.textPrimary,
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = item.danger ? colors.redLight : colors.muted)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {item.icon && (
                    <FontAwesomeIcon
                      icon={item.icon}
                      className="text-sm w-4"
                      style={{ color: item.danger ? colors.red : colors.textMuted }}
                    />
                  )}
                  {item.label}
                </button>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
