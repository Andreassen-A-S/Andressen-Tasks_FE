"use client";

import { useCallback, useState } from "react";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { colors } from "@/constants/colors";
import Button from "@/components/common/buttons/Button";
import {
  useFloating,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";

interface Props {
  open: boolean;
  triggerEl: HTMLElement | null;
  onClose: () => void;
  value: string | null;
  onSelect: (isoDate: string | null) => void;
}

const SHEET_WIDTH = 328;

const DAY_LABELS = ["Su", "Mo", "Ti", "On", "To", "Fr", "Lø"];
const MONTH_NAMES = [
  "Januar", "Februar", "Marts", "April", "Maj", "Juni",
  "Juli", "August", "September", "Oktober", "November", "December",
];

function toLocalDate(iso: string): Date {
  const datePart = iso.split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function DetailsDatePicker({ open, triggerEl, onClose, value, onSelect }: Props) {
  const today = new Date();
  const selected = value ? toLocalDate(value) : null;
  const initialViewDate = selected ?? today;

  const [viewYear, setViewYear] = useState(() => initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initialViewDate.getMonth());

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
    ],
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);
  const setFloatingRef = useCallback((node: HTMLDivElement | null) => {
    refs.setFloating(node);
  }, [refs]);

  if (!open) return null;

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  const cells: Array<{ date: Date; current: boolean }> = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ date: new Date(viewYear, viewMonth - 1, daysInPrev - i), current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(viewYear, viewMonth, d), current: true });
  }
  while (cells.length < 42) {
    cells.push({ date: new Date(viewYear, viewMonth + 1, cells.length - daysInMonth - firstDow + 1), current: false });
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <FloatingPortal>
      <div
        ref={setFloatingRef}
        style={{
          ...floatingStyles,
          visibility: isPositioned ? "visible" : "hidden",
          width: SHEET_WIDTH,
          backgroundColor: colors.white,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        }}
        className={`z-[9999] flex flex-col rounded-xl overflow-hidden${isPositioned ? " animate-in fade-in" : ""}`}
        {...getFloatingProps()}
      >
        {/* Month navigation */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4">
          <Button variant="secondary" size="md" icon={faChevronLeft} onClick={prevMonth} />
          <span className="label-md" style={{ color: colors.textPrimary }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <Button variant="secondary" size="md" icon={faChevronRight} onClick={nextMonth} />
        </div>

        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 px-4">
          {DAY_LABELS.map((d) => (
            <div key={d} className="flex items-center justify-center h-8">
              <span className="caption" style={{ color: colors.textMuted }}>{d}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid — always 7×6 */}
        <div className="grid grid-cols-7 gap-y-1 px-4 pb-4">
          {cells.map((cell, i) => {
            const isSelected = selected != null && isSameDay(cell.date, selected);
            const isToday = isSameDay(cell.date, today);
            return (
              <div key={i} className="flex items-center justify-center">
                <button
                  type="button"
                  disabled={!cell.current}
                  onClick={() => { onSelect(toIso(cell.date)); onClose(); }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                  style={{
                    backgroundColor: isSelected ? colors.green : "transparent",
                    textDecoration: isToday && !isSelected ? "underline" : undefined,
                    textUnderlineOffset: "3px",
                    cursor: cell.current ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && cell.current) e.currentTarget.style.backgroundColor = colors.muted;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected ? colors.green : "transparent";
                  }}
                >
                  <span
                    className="body-sm"
                    style={{
                      color: isSelected ? colors.white : cell.current ? colors.textPrimary : colors.textMuted,
                      fontWeight: isToday ? 600 : undefined,
                    }}
                  >
                    {cell.date.getDate()}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1 px-4 pb-4">
          <Button variant="ghost" size="sm" onClick={() => { onSelect(null); onClose(); }}>Ryd</Button>
          <Button variant="ghost" size="sm" onClick={() => { onSelect(toIso(new Date())); onClose(); }}>I dag</Button>
        </div>
      </div>
    </FloatingPortal>
  );
}
