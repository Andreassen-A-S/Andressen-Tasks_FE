import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { formatRelativeDate } from "@/helpers/helpers";

interface UserTaskDateNavigatorProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export default function UserTaskDateNavigator({
    selectedDate,
    onDateChange,
}: UserTaskDateNavigatorProps) {
    return (
        <div className="bg-white border-b border-gray-200 top-0 z-10 flex items-center justify-between w-full mx-auto py-2 px-4">
            <button
                onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 1);
                    onDateChange(newDate);
                }}
                className="px-2 py-1 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900"
                aria-label="Forrige dag"
            >
                <FontAwesomeIcon icon={faChevronLeft} size="xs" />
            </button>
            <div className="flex flex-col items-center text-center leading-tight">
                <span className="h4 text-gray-900">
                    {formatRelativeDate(selectedDate)}
                </span>
                <span className="mono-xs">
                    {selectedDate.toLocaleDateString("da-DK", {
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
                className="px-2 py-1 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900"
                aria-label="Næste dag"
            >
                <FontAwesomeIcon icon={faChevronRight} size="xs" />
            </button>
        </div>
    );
}