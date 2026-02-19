"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface CalendarMonthNavigatorProps {
    monthName: string;
    onPrev: () => void;
    onNext: () => void;
}

export default function CalendarMonthNavigator({
    monthName,
    onPrev,
    onNext,
}: CalendarMonthNavigatorProps) {
    return (
        <div className="bg-white border-b border-gray-200 flex items-center justify-between w-full mx-auto px-4 h-12">

            <button
                onClick={onPrev}
                className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-[#FAFAF7] transition-colors"
                aria-label="Forrige måned"
            >
                <FontAwesomeIcon icon={faChevronLeft} size="xs" className="text-[#6B7084]" />
            </button>
            <div className="h4">
                {monthName}
            </div>
            <button
                onClick={onNext}
                className="w-8 h-8 border border-gray-200 rounded-lg"
                aria-label="Næste måned"
            >
                <FontAwesomeIcon icon={faChevronRight} size="xs" className="text-[#6B7084]" />
            </button>

        </div>
    );
}