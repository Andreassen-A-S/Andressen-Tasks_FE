import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { formatLocalDate, formatRelativeDate } from "@/helpers/helpers";

interface UserTaskDateNavigatorProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export default function UserTaskDateNavigator({
    selectedDate,
    onDateChange,
}: UserTaskDateNavigatorProps) {
    return (
        <div className="bg-white border-b border-gray-200 top-0 z-10 flex items-center justify-between w-full mx-auto px-4 h-12">
            <button
                onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 1);
                    onDateChange(newDate);
                }}
                className="w-8 h-8 border border-gray-200 rounded-lg"
                aria-label="Forrige dag"
            >
                <FontAwesomeIcon icon={faChevronLeft} size="xs" className="text-[#6B7084]" />
            </button>
            <div className="flex flex-col items-center text-center leading-tight">
                <span className="h4">
                    {formatRelativeDate(selectedDate)}
                </span>
                <span className="mono-xs">
                    {formatLocalDate(selectedDate, "da-DK", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                    })}
                </span>
            </div>
            <button
                onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 1);
                    onDateChange(newDate);
                }}
                className="w-8 h-8 border border-gray-200 rounded-lg"
                aria-label="Næste dag"
            >
                <FontAwesomeIcon icon={faChevronRight} size="xs" className="text-[#6B7084]" />
            </button>
        </div>
    );
}
