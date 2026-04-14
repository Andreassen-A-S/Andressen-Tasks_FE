
interface SchedulingCardProps {
    startDate?: string;
    onStartDateChange: (date: string) => void;
}

export default function SchedulingCard({
    startDate,
    onStartDateChange,
}: SchedulingCardProps) {
    return (
        <div className="space-y-4">
            <h3 className="overline pt-1">
                Planlægning
            </h3>

            <div>
                <label htmlFor="start_date" className="label-lg mb-2 block">
                    Startdato
                </label>
                <input
                    type="date"
                    id="start_date"
                    value={startDate || ""}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors bg-white text-[#1B1D22] placeholder:text-[#9DA1B4]"
                />
                <p className="caption mt-1">Valgfrit: opgaven starter i dag, hvis ikke udfyldt</p>
            </div>
        </div>
    );
}