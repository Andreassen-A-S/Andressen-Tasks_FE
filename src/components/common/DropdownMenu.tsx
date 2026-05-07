"use client";

import { createContext, useCallback, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { colors } from "@/constants/colors";
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
  icon?: React.ReactNode;
  checked?: boolean;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  dividerBefore?: boolean;
  disabled?: boolean;
  subItems?: DropdownMenuItem[];
  subMenuWidth?: number;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  width?: number;
}

function renderIcon(icon: React.ReactNode | undefined, danger?: boolean) {
  if (!icon) return null;
  return <span className="w-4 flex items-center justify-center" style={{ color: danger ? colors.red : colors.textPrimary }}>{icon}</span>;
}

function renderItemContent(item: DropdownMenuItem, hasChecked: boolean) {
  return (
    <>
      {hasChecked && (
        <span className="w-4 flex items-center justify-center shrink-0">
          {item.checked && <Check className="w-4 h-4" style={{ color: item.danger ? colors.red : colors.textPrimary }} />}
        </span>
      )}
      {renderIcon(item.icon, item.danger)}
      <span className="flex-1">{item.label}</span>
    </>
  );
}

function SubMenuItem({ item, isOpen, onOpen, parentClose }: {
  item: DropdownMenuItem;
  isOpen: boolean;
  onOpen: () => void;
  parentClose: () => void;
}) {
  const { refs, floatingStyles, isPositioned } = useFloating({
    open: isOpen,
    placement: "right-start",
    strategy: "fixed",
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [offset({ mainAxis: -8, crossAxis: -4 }), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  const setReferenceRef = useCallback((node: HTMLDivElement | null) => { refs.setReference(node); }, [refs]);
  const setFloatingRef = useCallback((node: HTMLDivElement | null) => { refs.setFloating(node); }, [refs]);

  return (
    <>
      <div className="px-1.5" ref={setReferenceRef} onMouseEnter={onOpen}>
        <button
          type="button"
          className="w-full flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-md body-sm text-left transition-colors"
          style={{ color: colors.textPrimary, backgroundColor: isOpen ? colors.muted : "transparent" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.muted)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isOpen ? colors.muted : "transparent")}
        >
          {renderIcon(item.icon)}
          <span className="flex-1">{item.label}</span>
          <ChevronRight size={20} strokeWidth={1.5} className="-m-2" style={{ color: colors.textPrimary }} />
        </button>
      </div>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={setFloatingRef}
            style={{
              ...floatingStyles,
              visibility: isPositioned ? "visible" : "hidden",
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.white,
              boxShadow: "0 8px 24px rgba(140, 149, 159, 0.2)",
              ...(item.subMenuWidth && { width: item.subMenuWidth }),
            }}
            className={`z-[9999] min-w-[160px] rounded-lg py-1.5${isPositioned ? " animate-in fade-in zoom-in-95 ease-out" : ""}`}
          >
            {item.subItems!.map((sub) => (
              <div key={sub.label}>
                {sub.dividerBefore && <div className="my-1.5" style={{ borderTop: `1px solid ${colors.border}` }} />}
                <div className="px-1.5">
                  {sub.href ? (
                    <a
                      href={sub.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={parentClose}
                      className="w-full flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md body-sm transition-colors"
                      style={{ color: colors.textPrimary, backgroundColor: "transparent", textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.muted)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <span className="flex-1">{sub.label}</span>
                      {sub.icon && <span className="shrink-0" style={{ color: colors.textMuted }}>{sub.icon}</span>}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { parentClose(); sub.onClick?.(); }}
                      className="w-full flex items-center gap-2 pl-2 pr-10 py-1.5 rounded-md body-sm text-left transition-colors"
                      style={{ color: sub.danger ? colors.red : colors.textPrimary, backgroundColor: "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = sub.danger ? colors.redLight : colors.muted)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {renderIcon(sub.icon, sub.danger)}
                      {sub.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

export default function DropdownMenu({ trigger, items, width }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: (v) => { setOpen(v); if (!v) setOpenSubMenu(null); },
    placement: "bottom-start",
    strategy: "fixed",
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);
  const setReferenceRef = useCallback((node: HTMLDivElement | null) => { refs.setReference(node); }, [refs]);
  const setFloatingRef = useCallback((node: HTMLDivElement | null) => { refs.setFloating(node); }, [refs]);

  const hasChecked = items.some((i) => i.checked !== undefined);
  const closeAll = () => { setOpen(false); setOpenSubMenu(null); };

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
              ...(width && { width }),
            }}
            className={`z-[9999] min-w-[160px] rounded-lg py-1.5${isPositioned ? " animate-in fade-in zoom-in-95 ease-out" : ""}`}
            {...getFloatingProps()}
          >
            {items.map((item) => (
              <div key={item.label}>
                {item.dividerBefore && (
                  <div className="my-1.5" style={{ borderTop: `1px solid ${colors.border}` }} />
                )}
                {item.subItems ? (
                  <SubMenuItem
                    item={item}
                    isOpen={openSubMenu === item.label}
                    onOpen={() => setOpenSubMenu(item.label)}
                    parentClose={closeAll}
                  />
                ) : item.disabled ? (
                  <div className="px-1.5">
                    <p className="pl-2 pr-10 py-1.5 body-sm truncate" style={{ color: colors.textMuted }}>{item.label}</p>
                  </div>
                ) : (
                  <div className="px-1.5">
                    <button
                      type="button"
                      onClick={() => { closeAll(); item.onClick?.(); }}
                      className="w-full flex items-center gap-2 pl-2 pr-10 py-1.5 rounded-md body-sm text-left transition-colors"
                      style={{ color: item.danger ? colors.red : colors.textPrimary, backgroundColor: "transparent" }}
                      onMouseEnter={(e) => { setOpenSubMenu(null); e.currentTarget.style.backgroundColor = item.danger ? colors.redLight : colors.muted; }}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {renderItemContent(item, hasChecked)}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
