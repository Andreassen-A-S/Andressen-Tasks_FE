// RecurringCard.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import { RecurrenceFrequency } from "@/types/recuringTemplate";

interface RecurringCardProps {
    isRecurring: boolean;
    setIsRecurring: (val: boolean) => void;
    recurringData: {
        frequency: RecurrenceFrequency;
        interval: number;
        days_of_week: number[];
        day_of_month?: number;
        start_date: string;
        end_date?: string;
    };
    setRecurringData: (data: any) => void;
    isSubtask: boolean;
}

export default function RecurringCard({
    isRecurring,
    setIsRecurring,
    recurringData,
    setRecurringData,
    isSubtask,
}: RecurringCardProps) {
    // Don't render for subtasks
    if (isSubtask) return null;

    return (
        <>
            {/* Recurring Toggle Checkbox */}
            <div className="flex items-center gap-4">
                <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <div>
                    <span className="text-sm font-semibold text-gray-900">
                        Gentag
                    </span>
                    <p className="text-xs text-gray-500">
                        Slå til for at gentage denne opgave automatisk
                    </p>
                </div>
            </div>

            {/* Recurring Expanded fields */}
            {isRecurring && (
                <div>
                    {/* Interval & Frequency side by side */}
                    <div className="flex gap-4 mb-4">
                        {/* Frequency */}
                        <div className="flex-1">
                            <label htmlFor="frequency" className="block text-sm font-semibold text-gray-900 mb-2">
                                Gentag hver<span className="text-red-500">*</span>
                            </label>
                            <select
                                id="frequency"
                                value={recurringData.frequency}
                                onChange={(e) =>
                                    setRecurringData({
                                        ...recurringData,
                                        frequency: e.target.value as RecurrenceFrequency,
                                    })
                                }
                                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                            >
                                <option value={RecurrenceFrequency.DAILY}>Dag</option>
                                <option value={RecurrenceFrequency.WEEKLY}>Uge</option>
                                <option value={RecurrenceFrequency.MONTHLY}>Måned</option>
                                <option value={RecurrenceFrequency.YEARLY}>År</option>
                            </select>
                        </div>

                        {/* Interval */}
                        <div className="flex-1">
                            <label htmlFor="interval" className="block text-sm font-semibold text-gray-900 mb-2">
                                Interval
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    id="interval"
                                    min={1}
                                    value={recurringData.interval}
                                    onChange={(e) =>
                                        setRecurringData({
                                            ...recurringData,
                                            interval: parseInt(e.target.value) || 1,
                                        })
                                    }
                                    className="block w-20 rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                                />
                                <span className="text-sm text-gray-700">
                                    {recurringData.frequency === RecurrenceFrequency.DAILY && "dag(e)"}
                                    {recurringData.frequency === RecurrenceFrequency.WEEKLY && "uge(r)"}
                                    {recurringData.frequency === RecurrenceFrequency.MONTHLY && "måned(er)"}
                                    {recurringData.frequency === RecurrenceFrequency.YEARLY && "år"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Days of Week (for weekly) */}
                    {recurringData.frequency === RecurrenceFrequency.WEEKLY && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Ugedage</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: 1, label: "Man" },
                                    { value: 2, label: "Tir" },
                                    { value: 3, label: "Ons" },
                                    { value: 4, label: "Tor" },
                                    { value: 5, label: "Fre" },
                                    { value: 6, label: "Lør" },
                                    { value: 0, label: "Søn" },
                                ].map((day) => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => {
                                            const days = recurringData.days_of_week.includes(day.value)
                                                ? recurringData.days_of_week.filter((d) => d !== day.value)
                                                : [...recurringData.days_of_week, day.value];
                                            setRecurringData({ ...recurringData, days_of_week: days });
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${recurringData.days_of_week.includes(day.value)
                                            ? "bg-teal-600 text-white"
                                            : "bg-white text-gray-700 border-2 border-gray-200 hover:border-teal-500"
                                            }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Valgfrit: Lad tom for samme ugedag hver gang
                            </p>
                        </div>
                    )}

                    {/* Day of Month (for monthly) */}
                    {recurringData.frequency === RecurrenceFrequency.MONTHLY && (
                        <div>
                            <label htmlFor="day_of_month" className="block text-sm font-semibold text-gray-900 mb-2">
                                Dag i måneden
                            </label>
                            <input
                                type="number"
                                id="day_of_month"
                                min={1}
                                max={31}
                                placeholder="F.eks. 15"
                                value={recurringData.day_of_month ?? ""}
                                onChange={(e) =>
                                    setRecurringData({
                                        ...recurringData,
                                        day_of_month: e.target.value ? parseInt(e.target.value) : undefined,
                                    })
                                }
                                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Valgfrit: Lad tom for samme dag hver måned
                            </p>
                        </div>
                    )}

                    {/* Start Date */}
                    <div>
                        <label htmlFor="start_date" className="block text-sm font-semibold text-gray-900 mb-2">
                            Start dato<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="start_date"
                            required
                            value={recurringData.start_date}
                            onChange={(e) =>
                                setRecurringData({ ...recurringData, start_date: e.target.value })
                            }
                            className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label htmlFor="end_date" className="block text-sm font-semibold text-gray-900 mb-2">
                            Slut dato (valgfrit)
                        </label>
                        <input
                            type="date"
                            id="end_date"
                            value={recurringData.end_date ?? ""}
                            onChange={(e) =>
                                setRecurringData({
                                    ...recurringData,
                                    end_date: e.target.value || undefined,
                                })
                            }
                            className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                        />
                        <p className="mt-1 text-xs text-gray-500">Lad tom for at fortsætte på ubestemt tid</p>
                    </div>
                </div>
            )}
        </>
    );
}