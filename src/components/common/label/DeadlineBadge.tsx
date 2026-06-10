import { Clock } from "lucide-react";
import { colors } from "@/constants/colors";
import { formatRelativeDate, toDateKey } from "@/helpers/helpers";

interface DeadlineBadgeProps {
    deadline: string;
    size?: "sm" | "md" | "lg";
    bordered?: boolean;
}

const sizeClasses = {
    sm: "inline-flex items-center h-5 px-1.5 gap-1 badge-sm",
    md: "inline-flex items-center h-6 px-2 gap-1 badge-md",
    lg: "inline-flex items-center h-7 px-2.5 gap-1.5 badge-lg",
};

const borderedSizeClasses = {
    sm: "inline-flex items-center badge-sm gap-1 h-5 px-1.5 rounded-full border",
    md: "inline-flex items-center badge-md gap-1.5 h-6 px-2 rounded-full border",
    lg: "inline-flex items-center badge-lg gap-2 h-7 px-2.5 rounded-full border",
};

const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
};

type DeadlineState = "overdue" | "today" | "future";

function getDeadlineState(deadline: string): DeadlineState {
    const today = toDateKey(new Date());
    const d = toDateKey(deadline);
    if (d < today) return "overdue";
    if (d === today) return "today";
    return "future";
}

const stateColor: Record<DeadlineState, string> = {
    overdue: colors.red,
    today: colors.yellow,
    future: colors.textSecondary,
};


export default function DeadlineBadge({ deadline, size = "md", bordered = false }: DeadlineBadgeProps) {
    const state = getDeadlineState(deadline);
    const iconClass = `${iconSizeClasses[size]} shrink-0 stroke-2`;

    if (bordered) {
        return (
            <span className={`text-text-secondary bg-transparent border-border ${borderedSizeClasses[size]}`}>
                <Clock className={iconClass} style={{ color: stateColor[state] }} />
                <span className="font-semibold">{formatRelativeDate(deadline)}</span>
            </span>
        );
    }

    return (
        <span className={sizeClasses[size]} style={{ color: stateColor[state] }}>
            <Clock className={iconClass} />
            <span className="font-semibold">{formatRelativeDate(deadline)}</span>
        </span>
    );
}
