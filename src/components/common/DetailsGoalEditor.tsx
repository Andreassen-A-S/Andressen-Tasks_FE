"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { colors } from "@/constants/colors";
import Button from "@/components/common/buttons/Button";
import { TaskGoalType, TaskUnit } from "@/types/task";
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
import { formatNumber, parseLocalizedNumber } from "@/helpers/helpers";

interface Props {
  open: boolean;
  triggerEl: HTMLElement | null;
  onClose: () => void;
  goalType?: TaskGoalType | null;
  unit?: TaskUnit;
  targetQuantity?: number | null;
  currentQuantity?: number | null;
  onSave: (input: {
    goal_type: TaskGoalType;
    unit?: TaskUnit;
    target_quantity?: number | null;
    current_quantity?: number | null;
  }) => Promise<void> | void;
}

const SHEET_WIDTH = 328;
const UNIT_OPTIONS: Array<{ value: TaskUnit; label: string }> = [
  { value: TaskUnit.NONE, label: "Procent (%)" },
  { value: TaskUnit.METERS, label: "Meter (m)" },
  { value: TaskUnit.M2, label: "Kvadratmeter (m²)" },
  { value: TaskUnit.M3, label: "Kubikmeter (m³)" },
  { value: TaskUnit.TONS, label: "Ton (t)" },
  { value: TaskUnit.LOADS, label: "Læs" },
  { value: TaskUnit.PLUGS, label: "Stik" },
];

function getInitialCurrentQuantity(goalType?: TaskGoalType | null, currentQuantity?: number | null) {
  if (goalType !== TaskGoalType.FIXED) return null;
  return currentQuantity ?? null;
}

export default function DetailsGoalEditor({
  open,
  triggerEl,
  onClose,
  goalType,
  unit,
  targetQuantity,
  currentQuantity,
  onSave,
}: Props) {
  const initialUnit = unit ?? TaskUnit.NONE;
  const [draftUnit, setDraftUnit] = useState<TaskUnit>(initialUnit);
  const [draftTarget, setDraftTarget] = useState<string>(
    targetQuantity != null ? formatNumber(targetQuantity) : (initialUnit === TaskUnit.NONE ? "100" : ""),
  );
  const [draftCurrent, setDraftCurrent] = useState<string>(
    getInitialCurrentQuantity(goalType, currentQuantity) != null ? formatNumber(getInitialCurrentQuantity(goalType, currentQuantity)!) : "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [currentFocused, setCurrentFocused] = useState(false);
  const [targetFocused, setTargetFocused] = useState(false);
  const [unitFocused, setUnitFocused] = useState(false);
  const currentInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const { refs, floatingStyles, context, placement, isPositioned } = useFloating({
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

  const openAbove = placement.startsWith("top");
  const setFloatingRef = useCallback((node: HTMLDivElement | null) => {
    refs.setFloating(node);
  }, [refs]);

  useEffect(() => {
    if (!open) return;
    const nextUnit = unit ?? TaskUnit.NONE;
    setDraftUnit(nextUnit);
    setDraftTarget(targetQuantity != null ? formatNumber(targetQuantity) : (nextUnit === TaskUnit.NONE ? "100" : ""));
    setDraftCurrent(getInitialCurrentQuantity(goalType, currentQuantity) != null ? formatNumber(getInitialCurrentQuantity(goalType, currentQuantity)!) : "");
    setInputError(null);
    setTimeout(() => currentInputRef.current?.focus(), 50);
  }, [open, goalType, unit, targetQuantity, currentQuantity]);

  if (!open) return null;

  const isPercent = draftUnit === TaskUnit.NONE;

  async function handleSave() {
    const parsedTarget = parseLocalizedNumber(draftTarget);
    const currentWasEntered = draftCurrent.trim().length > 0;
    const parsedCurrent = currentWasEntered ? parseLocalizedNumber(draftCurrent) : 0;

    if (!isPercent && (!Number.isFinite(parsedTarget) || parsedTarget <= 0)) {
      setInputError("Mål skal være et tal større end 0.");
      targetInputRef.current?.focus();
      return;
    }

    if (currentWasEntered && (!Number.isFinite(parsedCurrent) || parsedCurrent < 0)) {
      setInputError("Start skal være et gyldigt tal på 0 eller derover.");
      currentInputRef.current?.focus();
      return;
    }

    setInputError(null);

    setIsSaving(true);
    try {
      await onSave({
        goal_type: TaskGoalType.FIXED,
        unit: draftUnit,
        target_quantity: isPercent ? 100 : parsedTarget,
        current_quantity: parsedCurrent,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClear() {
    setIsSaving(true);
    try {
      await onSave({
        goal_type: TaskGoalType.OPEN,
        unit: undefined,
        target_quantity: undefined,
        current_quantity: undefined,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

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
          boxShadow: "0 8px 24px rgba(140, 149, 159, 0.2)",
        }}
        className={`z-[9999] flex flex-col rounded-xl overflow-hidden${isPositioned ? ` animate-in fade-in ${openAbove ? "slide-in-from-bottom-1" : "slide-in-from-top-1"}` : ""}`}
        {...getFloatingProps()}
      >
        <div className="px-3 pt-2 pb-2 flex-shrink-0">
          <span className="label-md" style={{ color: colors.textPrimary, fontWeight: 700 }}>Rediger mål</span>
        </div>

        <div className="flex-shrink-0" style={{ borderTop: `1px solid ${colors.border}` }} />

        <div className="px-3 py-3">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <label className="min-w-0">
              <span className="mb-1 block caption" style={{ color: colors.textMuted }}>Start</span>
              <input
                ref={currentInputRef}
                id="goal-current"
                type="text"
                inputMode="decimal"
                value={draftCurrent}
                onChange={(e) => {
                  setDraftCurrent(e.target.value);
                  if (inputError) setInputError(null);
                }}
                onFocus={() => setCurrentFocused(true)}
                onBlur={() => setCurrentFocused(false)}
                placeholder="0"
                className="w-full rounded-lg border px-3 py-2 body-sm bg-white text-center transition-all focus:outline-none"
                style={{
                  borderColor: currentFocused ? colors.blue : colors.border,
                  boxShadow: currentFocused ? `0 0 0 3px ${colors.blueLight}` : "none",
                  color: colors.textPrimary,
                }}
              />
            </label>

            <span className="pb-2 flex-shrink-0" style={{ color: colors.textMuted }}>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </span>

            <label className="min-w-0">
              <span className="mb-1 block caption" style={{ color: colors.textMuted }}>Mål</span>
              <input
                ref={targetInputRef}
                id="goal-target"
                type="text"
                inputMode="decimal"
                value={isPercent ? "100" : draftTarget}
                onChange={(e) => {
                  setDraftTarget(e.target.value);
                  if (inputError) setInputError(null);
                }}
                onFocus={() => setTargetFocused(true)}
                onBlur={() => setTargetFocused(false)}
                placeholder={isPercent ? "100" : "Angiv mål"}
                disabled={isPercent}
                className="w-full rounded-lg border px-3 py-2 body-sm bg-white text-center transition-all [appearance:textfield] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{
                  borderColor: targetFocused ? colors.blue : colors.border,
                  boxShadow: targetFocused ? `0 0 0 3px ${colors.blueLight}` : "none",
                  color: colors.textPrimary,
                }}
              />
            </label>
          </div>

          <div className="mt-2">
            <label htmlFor="goal-unit" className="mb-1 block caption" style={{ color: colors.textMuted }}>Enhed</label>
            <select
              id="goal-unit"
              value={draftUnit}
              onChange={(e) => {
                const nextUnit = e.target.value as TaskUnit;
                setDraftUnit(nextUnit);
                if (nextUnit === TaskUnit.NONE) setDraftTarget("100");
              }}
              onFocus={() => setUnitFocused(true)}
              onBlur={() => setUnitFocused(false)}
              className="w-full rounded-lg border px-3 py-2 body-sm bg-white transition-all focus:outline-none"
              style={{
                borderColor: unitFocused ? colors.blue : colors.border,
                boxShadow: unitFocused ? `0 0 0 3px ${colors.blueLight}` : "none",
                color: colors.textPrimary,
              }}
            >
              {UNIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {isPercent && (
              <p className="mt-1 caption" style={{ color: colors.textMuted }}>
                Procentmål går altid til 100%.
              </p>
            )}
            {inputError && (
              <p className="mt-2 caption" style={{ color: colors.red }}>
                {inputError}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-3 pb-3">
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={isSaving}>Ryd</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Gemmer..." : "Gem"}
          </Button>
        </div>
      </div>
    </FloatingPortal>
  );
}
