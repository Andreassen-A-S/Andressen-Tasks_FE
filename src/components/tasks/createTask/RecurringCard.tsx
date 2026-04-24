import { RecurrenceFrequency } from "@/types/recuringTemplate";
import SelectField from "@/components/common/forms/SelectField";
import TextInput from "@/components/common/forms/TextInput";

interface RecurringCardProps {
    isRecurring: boolean;
    setIsRecurring: (val: boolean) => void;
    recurringData: {
        frequency: RecurrenceFrequency;
        interval: number;
        days_of_week: number[];
        day_of_month: number | undefined;
        start_date: string;
        end_date: string | undefined;
    };
    setRecurringData: (data: {
        frequency: RecurrenceFrequency;
        interval: number;
        days_of_week: number[];
        day_of_month: number | undefined;
        start_date: string;
        end_date: string | undefined;
    }) => void;
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
                            <SelectField
                                id="frequency"
                                value={recurringData.frequency}
                                onChange={(e) =>
                                    setRecurringData({
                                        ...recurringData,
                                        frequency: e.target.value as RecurrenceFrequency,
                                    })
                                }
                            >
                                <option value={RecurrenceFrequency.DAILY}>Dag</option>
                                <option value={RecurrenceFrequency.WEEKLY}>Uge</option>
                                <option value={RecurrenceFrequency.MONTHLY}>Måned</option>
                                <option value={RecurrenceFrequency.YEARLY}>År</option>
                            </SelectField>
                        </div>

                        {/* Interval */}
                        <div className="flex-1">
                            <label htmlFor="interval" className="label-lg mb-2 block">
                                Interval
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="w-20">
                                    <TextInput
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
                                    />
                                </div>
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
                            <TextInput
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
                        <TextInput
                            type="date"
                            id="start_date"
                            required
                            value={recurringData.start_date}
                            onChange={(e) =>
                                setRecurringData({ ...recurringData, start_date: e.target.value })
                            }
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label htmlFor="end_date" className="label-lg mb-2 block">
                            Slut dato (valgfrit)
                        </label>
                        <TextInput
                            type="date"
                            id="end_date"
                            value={recurringData.end_date ?? ""}
                            onChange={(e) =>
                                setRecurringData({
                                    ...recurringData,
                                    end_date: e.target.value || undefined,
                                })
                            }
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
