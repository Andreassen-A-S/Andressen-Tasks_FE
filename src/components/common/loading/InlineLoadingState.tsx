import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { colors } from "@/constants/colors";

interface InlineLoadingStateProps {
    label?: string;
    className?: string;
    centered?: boolean;
}

export default function InlineLoadingState({
    label = "Indlæser...",
    className = "",
    centered = false,
}: InlineLoadingStateProps) {
    return (
        <div
            className={[
                "flex items-center gap-3",
                centered ? "justify-center" : "",
                className,
            ].filter(Boolean).join(" ")}
        >
            <FontAwesomeIcon icon={faSpinner} spin style={{ color: colors.greenMid }} />
            <span className="body-sm" style={{ color: colors.textMuted }}>{label}</span>
        </div>
    );
}
