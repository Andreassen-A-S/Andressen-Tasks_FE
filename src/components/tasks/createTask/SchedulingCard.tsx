interface SchedulingCardProps {
    scheduledDate?: string;
    onScheduledDateChange: (date: string) => void;
}

export default function SchedulingCard({
    scheduledDate,
    onScheduledDateChange,
}: SchedulingCardProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b-2 border-gray-200">
                Planlægning
            </h3>

            <div>
                <label htmlFor="scheduled_date" className="block text-sm font-semibold text-gray-900 mb-2">
                    Planlagt dato
                </label>
                <input
                    type="date"
                    id="scheduled_date"
                    value={scheduledDate || ""}
                    onChange={(e) => onScheduledDateChange(e.target.value)}
                    className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                />
                <p className="mt-1 text-xs text-gray-500">Valgfrit: Hvornår skal denne opgave udføres?</p>
            </div>
        </div>
    );
}