import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { colors } from "@/constants/colors";
import { formatRelativeDate } from "@/helpers/helpers";

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(deadline);
    d.setHours(0, 0, 0, 0);
    if (d < today) return colors.red;
    if (d.getTime() === today.getTime()) return colors.yellow;
    return colors.textMuted;
}

export default function DeadlineBadge({ deadline, size = "md" }: DeadlineBadgeProps) {
    const color = getDeadlineColor(deadline);
    return (
        <span className={`inline-flex items-center ${sizeClasses[size]}`} style={{ color }}>
            <FontAwesomeIcon icon={faClock} className="w-3 h-3 flex-shrink-0" />
            <span>{formatRelativeDate(deadline)}</span>
        </span>
    );
}
