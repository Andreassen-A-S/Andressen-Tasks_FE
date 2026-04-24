
import TextInput from "@/components/common/forms/TextInput";

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
                <TextInput
                    type="date"
                    id="start_date"
                    value={startDate || ""}
                    onChange={(e) => onStartDateChange(e.target.value)}
                />
                <p className="caption mt-1">Valgfrit: opgaven starter i dag, hvis ikke udfyldt</p>
            </div>
        </div>
    );
}
