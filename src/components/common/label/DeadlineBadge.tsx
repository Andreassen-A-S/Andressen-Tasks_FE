import { Clock } from "lucide-react";
import { colors } from "@/constants/colors";
import { formatRelativeDate, toDateKey } from "@/helpers/helpers";

interface DeadlineBadgeProps {
    deadline: string;
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2",
};

function getDeadlineColor(deadline: string): string {
    const today = toDateKey(new Date());
    const d = toDateKey(deadline);
    if (d < today) return colors.red;
    if (d === today) return colors.yellow;
    return colors.textMuted;
}

export default function DeadlineBadge({ deadline, size = "md" }: DeadlineBadgeProps) {
    const color = getDeadlineColor(deadline);
    return (
        <span className={`inline-flex items-center ${sizeClasses[size]}`} style={{ color }}>
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{formatRelativeDate(deadline)}</span>
        </span>
    );
}
