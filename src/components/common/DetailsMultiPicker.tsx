"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Search } from "lucide-react";

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

export interface MultiPickerOption {
  value: string;
  label: string;
  subtitle?: string;
  color?: string;
}

interface Props {
  open: boolean;
  triggerEl: HTMLElement | null;
  onClose: () => void;
  title: string;
  options: MultiPickerOption[];
  selectedValues: string[];
  onSelect: (values: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const SHEET_WIDTH = 280;
const SHEET_MAX_HEIGHT = 360;

export default function DetailsMultiPicker({
  open,
  triggerEl,
  onClose,
  title,
  options,
  selectedValues,
  onSelect,
  searchable,
  searchPlaceholder = "Søg...",
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
  const selectedValuesRef = useRef(selectedValues);

  useEffect(() => { filteredRef.current = filtered; }, [filtered]);
  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { selectedValuesRef.current = selectedValues; }, [selectedValues]);

  useEffect(() => {
    if (!open) return;
    if (searchable) setTimeout(() => searchRef.current?.focus(), 50);
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (filteredRef.current.length === 0) return;
        const next = Math.min(activeIndexRef.current + 1, filteredRef.current.length - 1);
        setActiveIndex(next);
        activeIndexRef.current = next;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (filteredRef.current.length === 0) return;
        const next = Math.max(activeIndexRef.current - 1, 0);
        setActiveIndex(next);
        activeIndexRef.current = next;
      } else if (e.key === "Enter") {
        e.preventDefault();
        const option = filteredRef.current[activeIndexRef.current];
        if (option) {
          const current = selectedValuesRef.current;
          onSelect(
            current.includes(option.value)
              ? current.filter((v) => v !== option.value)
              : [...current, option.value]
          );
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onSelect, open, searchable]);

  if (!open) return null;

  const toggle = (value: string) => {
    onSelect(
      selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value]
    );
  };

  return (
    <FloatingPortal>
      <div
        ref={setFloatingRef}
        style={{
          ...floatingStyles,
          visibility: isPositioned ? "visible" : "hidden",
          backgroundColor: colors.white,
          border: `1px solid ${colors.border}`,
          boxShadow: "var(--shadow-elevated)",
        }}
        className={`z-[9999] flex flex-col rounded-xl overflow-hidden${isPositioned ? " animate-in fade-in" : ""}`}
        {...getFloatingProps()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
          <span className="body-sm" style={{ color: colors.textPrimary, fontWeight: 700 }}>{title}</span>
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
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: colors.textMuted }} />
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
          </div>
        )}

        <div className="flex-shrink-0" style={{ borderTop: `1px solid ${colors.border}` }} />

        {/* Options */}
        <div className="overflow-y-auto flex-1 min-h-0 px-2 py-2">
          {filtered.length === 0 ? (
            <div className="px-2 py-2 body-sm" style={{ color: colors.textMuted }}>Ingen resultater</div>
          ) : (
            filtered.map((option, i) => {
              const isSelected = selectedValues.includes(option.value);
              const isActive = activeIndex === i;
              return (
                <div key={option.value}>
                  <button
                    type="button"
                    onClick={() => toggle(option.value)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors cursor-pointer"
                    style={{ backgroundColor: isActive ? colors.muted : "transparent" }}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <span
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        border: `1.5px solid ${isSelected ? colors.green : colors.border}`,
                        backgroundColor: isSelected ? colors.green : "transparent",
                      }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" style={{ color: colors.textWhite }} />}
                    </span>

                    {option.color != null && (
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: option.color }} />
                    )}

                    <span className="flex-1 min-w-0">
                      <span className="block body-sm truncate" style={{ color: colors.textPrimary, fontWeight: 600 }}>
                        {option.label}
                      </span>
                      {option.subtitle && (
                        <span className="block body-xs truncate">{option.subtitle}</span>
                      )}
                    </span>
                  </button>
                  {i < filtered.length - 1 && (
                    <div className="ml-8 mr-2 transition-opacity" style={{ borderTop: `1px solid ${colors.border}`, opacity: activeIndex === i || activeIndex === i + 1 ? 0 : 1 }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </FloatingPortal>
  );
}
