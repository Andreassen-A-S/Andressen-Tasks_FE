"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { colors } from "@/constants/colors";
import {
  useFloating,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useDismiss,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";

export interface SinglePickerOption {
  value: string;
  label: string;
  subtitle?: string;
  color?: { accent: string; bg: string };
}

interface Props {
  open: boolean;
  triggerEl: HTMLElement | null;
  onClose: () => void;
  title: string;
  options: SinglePickerOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  clearable?: boolean;
}

const SHEET_WIDTH = 280;
const SHEET_MAX_HEIGHT = 360;

export default function DetailsSinglePicker({
  open,
  triggerEl,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  searchable,
  searchPlaceholder = "Søg...",
  clearable,
}: Props) {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: (v) => { if (!v) onClose(); },
    placement: "bottom-start",
    strategy: "fixed",
    transform: false,
    whileElementsMounted: autoUpdate,
    elements: { reference: triggerEl },
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(SHEET_MAX_HEIGHT, availableHeight)}px`,
            width: `${SHEET_WIDTH}px`,
          });
        },
      }),
    ],
  });

  const dismiss = useDismiss(context, { escapeKey: false });
  const { getFloatingProps } = useInteractions([dismiss]);
  const setFloatingRef = useCallback((node: HTMLDivElement | null) => {
    refs.setFloating(node);
  }, [refs]);

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const filteredRef = useRef(filtered);
  const activeIndexRef = useRef(activeIndex);
  const selectedValueRef = useRef(selectedValue);
  const clearableRef = useRef(clearable);

  useEffect(() => { filteredRef.current = filtered; }, [filtered]);
  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { selectedValueRef.current = selectedValue; }, [selectedValue]);
  useEffect(() => { clearableRef.current = clearable; }, [clearable]);

  useEffect(() => {
    if (!open) return;
    if (searchable) setTimeout(() => searchRef.current?.focus(), 50);
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(activeIndexRef.current + 1, filteredRef.current.length - 1);
        setActiveIndex(next);
        activeIndexRef.current = next;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = Math.max(activeIndexRef.current - 1, 0);
        setActiveIndex(next);
        activeIndexRef.current = next;
      } else if (e.key === "Enter") {
        e.preventDefault();
        const option = filteredRef.current[activeIndexRef.current];
        if (option) {
          onSelect(clearableRef.current && option.value === selectedValueRef.current ? "" : option.value);
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onSelect, open, searchable]);

  if (!open) return null;

  return (
    <FloatingPortal>
      <div
        ref={setFloatingRef}
        style={{
          ...floatingStyles,
          visibility: isPositioned ? "visible" : "hidden",
          backgroundColor: colors.white,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        }}
        className={`z-[9999] flex flex-col rounded-xl overflow-hidden${isPositioned ? " animate-in fade-in" : ""}`}
        {...getFloatingProps()}
      >
        {/* Header */}
        <div className="px-4 pt-2 pb-2 flex-shrink-0">
          <span className="label-md" style={{ color: colors.textPrimary, fontWeight: 700 }}>{title}</span>
        </div>

        {/* Search */}
        {searchable && (
          <div className="px-2 pb-2 flex-shrink-0">
            <div
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all"
              style={{
                border: `1px solid ${searchFocused ? colors.blue : colors.border}`,
                boxShadow: searchFocused ? `0 0 0 3px ${colors.blueLight}` : "none",
                backgroundColor: colors.white,
              }}
            >
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="text-xs flex-shrink-0"
                style={{ color: searchFocused ? colors.blue : colors.textMuted }}
              />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setActiveIndex(0); }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent outline-none body-sm"
                style={{ color: colors.textPrimary }}
              />
            </div>
          </div >
        )
        }

        <div className="flex-shrink-0" style={{ borderTop: `1px solid ${colors.border}` }} />

        {/* Options */}
        <div className="overflow-y-auto flex-1 min-h-0 px-2 py-2">
          {filtered.length === 0 ? (
            <div className="px-2 py-2 body-sm" style={{ color: colors.textMuted }}>Ingen resultater</div>
          ) : (
            filtered.map((option, i) => {
              const isSelected = option.value === selectedValue;
              const isActive = activeIndex === i;
              return (
                <div key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(clearable && option.value === selectedValue ? "" : option.value);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors cursor-pointer"
                    style={{ backgroundColor: isActive ? colors.muted : "transparent" }}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    {option.color != null && (
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 border-2 border-${option.color.accent} bg-${option.color.bg}`} />
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="block label-md truncate" style={{ color: colors.textPrimary }}>{option.label}</span>
                      {option.subtitle && (
                        <span className="block body-xs truncate">{option.subtitle}</span>
                      )}
                    </span>
                    {isSelected && (
                      <FontAwesomeIcon icon={faCheck} className="text-xs flex-shrink-0" style={{ color: colors.textSecondary }} />
                    )}
                  </button>
                  {i < filtered.length - 1 && (
                    <div className="ml-7 mr-2 transition-opacity" style={{ borderTop: `1px solid ${colors.border}`, opacity: activeIndex === i || activeIndex === i + 1 ? 0 : 1 }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div >
    </FloatingPortal >
  );
}
