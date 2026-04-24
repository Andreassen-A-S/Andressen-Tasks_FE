"use client";

import { createContext, useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { colors } from "@/constants/colors";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import {
  useFloating,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";

export const DropdownOpenContext = createContext(false);

export interface DropdownMenuItem {
  label: string;
  icon?: IconDefinition;
  checked?: boolean;
  onClick: () => void;
  danger?: boolean;
  dividerBefore?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
}

export default function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    strategy: "fixed",
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);
  const setReferenceRef = useCallback((node: HTMLDivElement | null) => {
    refs.setReference(node);
  }, [refs]);
  const setFloatingRef = useCallback((node: HTMLDivElement | null) => {
    refs.setFloating(node);
  }, [refs]);

  return (
    <>
      <DropdownOpenContext.Provider value={open}>
        <div ref={setReferenceRef} className="cursor-pointer inline-flex" {...getReferenceProps()}>
          {trigger}
        </div>
      </DropdownOpenContext.Provider>

      {open && (
        <FloatingPortal>
          <div
            ref={setFloatingRef}
            style={{
              ...floatingStyles,
              visibility: isPositioned ? "visible" : "hidden",
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.white,
              boxShadow: "0 8px 24px rgba(140, 149, 159, 0.2)",
            }}
            className={`z-[9999] min-w-[160px] rounded-lg py-1.5${isPositioned ? " animate-in fade-in zoom-in-95 ease-out" : ""}`}
            {...getFloatingProps()}
          >
            {(() => {
              const hasChecked = items.some((i) => i.checked !== undefined);
              return items.map((item) => (
                <div key={item.label}>
                  {item.dividerBefore && (
                    <div className="my-1.5" style={{ borderTop: `1px solid ${colors.border}` }} />
                  )}
                  <div className="px-1.5">
                    <button
                      type="button"
                      onClick={() => { setOpen(false); item.onClick(); }}
                      className="w-full flex items-center gap-2 pl-2 pr-10 py-1.5 rounded-md body-sm text-left transition-colors"
                      style={{ color: item.danger ? colors.red : colors.textPrimary, backgroundColor: "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = item.danger ? colors.redLight : colors.muted)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {hasChecked && (
                        <span className="w-4 flex items-center justify-center shrink-0">
                          {item.checked && (
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-sm w-3"
                              style={{ color: item.danger ? colors.red : colors.textPrimary }}
                            />
                          )}
                        </span>
                      )}
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
              ));
            })()}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
