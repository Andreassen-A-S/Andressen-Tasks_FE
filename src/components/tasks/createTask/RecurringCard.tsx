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
    hideToggle?: boolean;
}

export default function RecurringCard({
    isRecurring,
    setIsRecurring,
    recurringData,
    setRecurringData,
    isSubtask,
    hideToggle = false
}: RecurringCardProps) {
    // Don't render for subtasks
    if (isSubtask) return null;

    return (
        <>
            {/* Recurring Toggle Checkbox */}
            {!hideToggle && (
                <div className="flex items-center gap-4 mb-4">
                    <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="rounded border-[#E8E6E1] text-[#2C5FE0] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:border-[#2D9F6F] h-4 w-4"
                    />
                    <div>
                        <span className="label-lg">Gentag</span>
                        <p className="caption">
                            Slå til for at gentage denne opgave automatisk
                        </p>
                    </div>
                </div>
            )}

            {/* Recurring Expanded fields */}
            {isRecurring && (
                <div className="space-y-6">
                    {/* Interval & Frequency side by side */}
                    <div className="flex gap-4">
                        {/* Frequency */}
                        <div className="flex-1">
                            <label htmlFor="frequency" className="label-lg mb-2 block">
                                Gentag hver<span className="text-[#D64545]">*</span>
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
                                className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md bg-white focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors"
                            >
                                <option value={RecurrenceFrequency.DAILY}>Dag</option>
                                <option value={RecurrenceFrequency.WEEKLY}>Uge</option>
                                <option value={RecurrenceFrequency.MONTHLY}>Måned</option>
                                <option value={RecurrenceFrequency.YEARLY}>År</option>
                            </select>
                        </div>

                        {/* Interval */}
                        <div className="flex-1">
                            <label htmlFor="interval" className="label-lg mb-2 block">
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
                                    className="block w-20 rounded-lg border border-[#E8E6E1] px-4 py-3 body-md bg-white focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors"
                                />
                                <span className="body-sm text-[#6B7084]">
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
                            <label className="label-lg mb-2 block">Ugedage</label>
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
                                        className={`px-4 py-2 rounded-lg btn-md font-medium transition-colors ${recurringData.days_of_week.includes(day.value)
                                            ? "bg-[#2C5FE0] text-white"
                                            : "bg-white text-[#6B7084] border border-[#E8E6E1] hover:border-[#2C5FE0]"
                                            }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                            <p className="caption mt-2">
                                Valgfrit: Lad tom for samme ugedag hver gang
                            </p>
                        </div>
                    )}

                    {/* Day of Month (for monthly) */}
                    {recurringData.frequency === RecurrenceFrequency.MONTHLY && (
                        <div>
                            <label htmlFor="day_of_month" className="label-lg mb-2 block">
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
                                className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md bg-white placeholder:text-[#9DA1B4] focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors"
                            />
                            <p className="caption mt-1">
                                Valgfrit: Lad tom for samme dag hver måned
                            </p>
                        </div>
                    )}

                    {/* Start Date */}
                    <div>
                        <label htmlFor="start_date" className="label-lg mb-2 block">
                            Start dato<span className="text-[#D64545]">*</span>
                        </label>
                        <input
                            type="date"
                            id="start_date"
                            required
                            value={recurringData.start_date}
                            onChange={(e) =>
                                setRecurringData({ ...recurringData, start_date: e.target.value })
                            }
                            className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md bg-white focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label htmlFor="end_date" className="label-lg mb-2 block">
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
                            className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md bg-white focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors"
                        />
                        <p className="caption mt-1">
                            Lad tom for at fortsætte på ubestemt tid
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}