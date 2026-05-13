"use client";

import { createContext, useCallback, useEffect, useRef, useState } from "react";
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
  FloatingTree,
  FloatingNode,
  FloatingFocusManager,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useListNavigation,
  useRole,
  useHover,
  useTypeahead,
} from "@floating-ui/react";

export const DropdownOpenContext = createContext(false);

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
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
  return (
    <span className="shrink-0 flex items-center justify-center" style={{ color: danger ? colors.red : colors.textPrimary }}>
      {icon}
    </span>
  );
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
      {item.badge}
    </>
  );
}

function isExternalHref(href: string) {
  return href.startsWith("http");
}

// Background is declarative so hover cannot stick if a portal/submenu opens before mouseleave fires.
const ITEM_CLS = "w-full flex items-center gap-2 px-2 py-1.5 rounded-md body-sm text-left outline-none transition-colors hover:bg-surface-subtle data-[active]:bg-surface-subtle data-[open]:bg-surface-subtle";
const DANGER_ITEM_CLS = "w-full flex items-center gap-2 px-2 py-1.5 rounded-md body-sm text-left outline-none transition-colors hover:bg-danger-surface data-[active]:bg-danger-surface data-[open]:bg-danger-surface";

function SubMenuItem({
  item,
  allowHover,
  isOpen,
  onOpenChange,
  active,
  parentItemRef,
  parentItemProps,
}: {
  item: DropdownMenuItem;
  allowHover: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  parentItemRef: (node: HTMLButtonElement | null) => void;
  parentItemProps: React.HTMLProps<HTMLElement>;
  active: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  const tree = useFloatingTree();
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    nodeId,
    open: isOpen,
    onOpenChange: (nextOpen) => {
      onOpenChange(nextOpen);
      if (!nextOpen) setActiveIndex(null);
    },
    placement: "right-start",
    strategy: "fixed",
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [offset({ mainAxis: 0, alignmentAxis: -4 }), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  const hover = useHover(context, {
    enabled: allowHover,
    delay: { open: 75 },
    // No-op handleClose: submenu stays open when mouse leaves — closing is driven
    // exclusively by tree events (sibling hover / regular item hover).
    handleClose: () => () => { },
  });
  const click = useClick(context, {
    event: "mousedown",
    toggle: !allowHover,
    ignoreMouse: allowHover,
  });
  const dismiss = useDismiss(context, { bubbles: true });
  const role = useRole(context, { role: "menu" });
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    nested: true,
    loop: true,
    disabledIndices: item.subItems?.flatMap((sub, i) => (sub.disabled ? [i] : [])) ?? [],
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    onMatch: isOpen ? setActiveIndex : undefined,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    hover,
    click,
    dismiss,
    role,
    listNavigation,
    typeahead,
  ]);

  useEffect(() => {
    if (!tree) return;
    function onMenuOpen(event: { nodeId: string; parentId: string }) {
      if (event.nodeId !== nodeId && event.parentId === parentId) onOpenChange(false);
    }
    function onItemHover(event: { parentId: string }) {
      if (event.parentId === parentId) onOpenChange(false);
    }
    function onTreeClick() { onOpenChange(false); }
    tree.events.on("menuopen", onMenuOpen);
    tree.events.on("itemhover", onItemHover);
    tree.events.on("click", onTreeClick);
    return () => {
      tree.events.off("menuopen", onMenuOpen);
      tree.events.off("itemhover", onItemHover);
      tree.events.off("click", onTreeClick);
    };
  }, [tree, nodeId, parentId, onOpenChange]);

  useEffect(() => {
    if (isOpen && tree) tree.events.emit("menuopen", { nodeId, parentId });
  }, [isOpen, tree, nodeId, parentId]);

  useEffect(() => {
    labelsRef.current = item.subItems?.map((sub) => (sub.disabled ? null : sub.label)) ?? [];
  }, [item.subItems]);

  const setReferenceRef = useCallback((node: HTMLButtonElement | null) => {
    refs.setReference(node);
    parentItemRef(node);
  }, [refs, parentItemRef]);
  const setFloatingRef = useCallback((node: HTMLDivElement | null) => {
    refs.setFloating(node);
  }, [refs]);

  return (
    <FloatingNode id={nodeId}>
      <div className="px-1.5">
        <button
          ref={setReferenceRef}
          data-open={isOpen || undefined}
          data-active={active || undefined}
          type="button"
          className={ITEM_CLS}
          style={{ color: colors.textPrimary }}
          {...getReferenceProps({
            ...parentItemProps,
            tabIndex: parentItemProps.tabIndex,
            onFocus: (e: React.FocusEvent) => {
              (parentItemProps as React.HTMLProps<HTMLButtonElement>).onFocus?.(e as React.FocusEvent<HTMLButtonElement>);
            },
            onBlur: (e: React.FocusEvent) => {
              (parentItemProps as React.HTMLProps<HTMLButtonElement>).onBlur?.(e as React.FocusEvent<HTMLButtonElement>);
            },
            onMouseEnter: (e: React.MouseEvent) => {
              (parentItemProps as React.HTMLProps<HTMLButtonElement>).onMouseEnter?.(e as React.MouseEvent<HTMLButtonElement>);
            },
            onMouseLeave: (e: React.MouseEvent) => {
              (parentItemProps as React.HTMLProps<HTMLButtonElement>).onMouseLeave?.(e as React.MouseEvent<HTMLButtonElement>);
            },
          })}
        >
          {renderIcon(item.icon)}
          <span className="flex-1">{item.label}</span>
          <ChevronRight size={20} strokeWidth={1.5} className="-mr-2" style={{ color: colors.textPrimary }} />
        </button>
      </div>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={-1} returnFocus={false}>
            <div
              ref={setFloatingRef}
              style={{
                ...floatingStyles,
                visibility: isPositioned ? "visible" : "hidden",
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.white,
                boxShadow: "var(--shadow-elevated)",
                ...(item.subMenuWidth && { width: item.subMenuWidth }),
              }}
              className={`z-[9999] min-w-[160px] rounded-lg py-1.5 outline-none${isPositioned ? " animate-in fade-in zoom-in-95 ease-out" : ""}`}
              {...getFloatingProps({ tabIndex: -1 })}
            >
              {item.subItems!.map((sub, i) => (
                <div key={i}>
                  {sub.dividerBefore && (
                    <div className="my-1.5" style={{ borderTop: `1px solid ${colors.border}` }} />
                  )}
                  <div className="px-1.5">
                    {sub.disabled ? (
                      <p className="px-2 py-1.5 body-sm truncate" style={{ color: colors.textMuted }}>
                        {sub.label}
                      </p>
                    ) : sub.href ? (
                      <a
                        ref={(node) => { listRef.current[i] = node; }}
                        href={sub.href}
                        target={isExternalHref(sub.href) ? "_blank" : undefined}
                        rel={isExternalHref(sub.href) ? "noopener noreferrer" : undefined}
                        data-active={activeIndex === i || undefined}
                        className={ITEM_CLS}
                        style={{ color: colors.textPrimary, textDecoration: "none" }}
                        {...getItemProps({
                          tabIndex: activeIndex === i ? 0 : -1,
                          onClick: () => tree?.events.emit("click"),
                        })}
                      >
                        <span className="flex-1">{sub.label}</span>
                        {sub.icon && <span className="shrink-0" style={{ color: colors.textMuted }}>{sub.icon}</span>}
                      </a>
                    ) : (
                      <button
                        ref={(node) => { listRef.current[i] = node; }}
                        type="button"
                        data-active={activeIndex === i || undefined}
                        className={sub.danger ? DANGER_ITEM_CLS : ITEM_CLS}
                        style={{ color: sub.danger ? colors.red : colors.textPrimary }}
                        {...getItemProps({
                          tabIndex: activeIndex === i ? 0 : -1,
                          onClick: () => { tree?.events.emit("click"); sub.onClick?.(); },
                        })}
                      >
                        {renderIcon(sub.icon, sub.danger)}
                        <span className="flex-1">{sub.label}</span>
                        {sub.badge}
                        {sub.checked !== undefined && (
                          <Check className="w-4 h-4 shrink-0" style={{ color: colors.textPrimary, opacity: sub.checked ? 1 : 0 }} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </FloatingNode>
  );
}

function DropdownMenuInner({ trigger, items, width }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [openSubMenuIndex, setOpenSubMenuIndex] = useState<number | null>(null);
  const [allowHover, setAllowHover] = useState(false);
  const nodeId = useFloatingNodeId();
  const tree = useFloatingTree();
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    nodeId,
    open: isOpen,
    onOpenChange: (nextOpen) => {
      setIsOpen(nextOpen);
      if (!nextOpen) {
        setActiveIndex(null);
        setOpenSubMenuIndex(null);
      }
    },
    placement: "bottom-start",
    strategy: "fixed",
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  const click = useClick(context, { event: "mousedown" });
  const dismiss = useDismiss(context, { bubbles: true });
  const role = useRole(context, { role: "menu" });
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
    disabledIndices: items.flatMap((item, i) => (item.disabled ? [i] : [])),
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    onMatch: isOpen ? setActiveIndex : undefined,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNavigation,
    typeahead,
  ]);

  const setReferenceRef = useCallback((node: HTMLDivElement | null) => {
    refs.setReference(node);
  }, [refs]);
  const setFloatingRef = useCallback((node: HTMLDivElement | null) => {
    refs.setFloating(node);
  }, [refs]);

  useEffect(() => {
    function onPointerMove({ pointerType }: PointerEvent) {
      if (pointerType !== "touch") setAllowHover(true);
    }
    function onKeyDown() { setAllowHover(false); }
    window.addEventListener("pointermove", onPointerMove, { once: true, capture: true });
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("pointermove", onPointerMove, { capture: true });
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [allowHover]);

  useEffect(() => {
    if (!tree) return;
    function handleTreeClick() {
      setIsOpen(false);
      setOpenSubMenuIndex(null);
    }
    tree.events.on("click", handleTreeClick);
    return () => { tree.events.off("click", handleTreeClick); };
  }, [tree]);

  useEffect(() => {
    labelsRef.current = items.map((item) => (item.disabled || item.subItems ? null : item.label));
  }, [items]);

  const hasChecked = items.some((i) => i.checked !== undefined);

  return (
    <FloatingNode id={nodeId}>
      <DropdownOpenContext.Provider value={isOpen}>
        <div ref={setReferenceRef} className="cursor-pointer inline-flex" {...getReferenceProps()}>
          {trigger}
        </div>
      </DropdownOpenContext.Provider>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={setFloatingRef}
              style={{
                ...floatingStyles,
                visibility: isPositioned ? "visible" : "hidden",
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.white,
                boxShadow: "var(--shadow-elevated)",
                ...(width && { width }),
              }}
              className={`z-[9999] min-w-[160px] rounded-lg py-1.5 outline-none${isPositioned ? " animate-in fade-in zoom-in-95 ease-out" : ""}`}
              {...getFloatingProps({ tabIndex: -1 })}
            >
              {items.map((item, i) => (
                <div key={item.label}>
                  {item.dividerBefore && (
                    <div className="my-1.5" style={{ borderTop: `1px solid ${colors.border}` }} />
                  )}
                  {item.subItems ? (
                    <SubMenuItem
                      item={item}
                      allowHover={allowHover}
                      isOpen={openSubMenuIndex === i}
                      onOpenChange={(open) => {
                        if (open) {
                          setOpenSubMenuIndex(i);
                          setActiveIndex(i);
                        } else {
                          // Only clear if this submenu was actually the open one —
                          // prevents clobbering another submenu that just opened.
                          setOpenSubMenuIndex(prev => prev === i ? null : prev);
                        }
                      }}
                      active={openSubMenuIndex === null && activeIndex === i}
                      parentItemRef={(node) => { listRef.current[i] = node; }}
                      parentItemProps={getItemProps({
                        tabIndex: activeIndex === i ? 0 : -1,
                        onMouseEnter: () => {
                          setActiveIndex(i);
                          if (allowHover) setOpenSubMenuIndex(i);
                        },
                      }) as React.HTMLProps<HTMLElement>}
                    />
                  ) : item.disabled ? (
                    <div className="px-1.5">
                      <p className="px-2 py-1.5 body-sm truncate" style={{ color: colors.textMuted }}>
                        {item.label}
                      </p>
                    </div>
                  ) : item.href ? (
                    <div className="px-1.5">
                      <a
                        ref={(node) => { listRef.current[i] = node; }}
                        href={item.href}
                        target={isExternalHref(item.href) ? "_blank" : undefined}
                        rel={isExternalHref(item.href) ? "noopener noreferrer" : undefined}
                        data-active={(openSubMenuIndex === null && activeIndex === i) || undefined}
                        className={item.danger ? DANGER_ITEM_CLS : ITEM_CLS}
                        style={{ color: item.danger ? colors.red : colors.textPrimary, textDecoration: "none" }}
                        {...getItemProps({
                          tabIndex: activeIndex === i ? 0 : -1,
                          onClick: () => { tree?.events.emit("click"); item.onClick?.(); },
                          onMouseEnter: () => {
                            setOpenSubMenuIndex(null);
                            setActiveIndex(i);
                            tree?.events.emit("itemhover", { parentId: nodeId });
                          },
                        })}
                      >
                        {renderItemContent(item, hasChecked)}
                      </a>
                    </div>
                  ) : (
                    <div className="px-1.5">
                      <button
                        ref={(node) => { listRef.current[i] = node; }}
                        type="button"
                        data-active={(openSubMenuIndex === null && activeIndex === i) || undefined}
                        className={item.danger ? DANGER_ITEM_CLS : ITEM_CLS}
                        style={{ color: item.danger ? colors.red : colors.textPrimary }}
                        {...getItemProps({
                          tabIndex: activeIndex === i ? 0 : -1,
                          onClick: () => { tree?.events.emit("click"); item.onClick?.(); },
                          onMouseEnter: () => {
                            setOpenSubMenuIndex(null);
                            setActiveIndex(i);
                            tree?.events.emit("itemhover", { parentId: nodeId });
                          },
                        })}
                      >
                        {renderItemContent(item, hasChecked)}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </FloatingNode>
  );
}

export default function DropdownMenu(props: DropdownMenuProps) {
  return (
    <FloatingTree>
      <DropdownMenuInner {...props} />
    </FloatingTree>
  );
}
