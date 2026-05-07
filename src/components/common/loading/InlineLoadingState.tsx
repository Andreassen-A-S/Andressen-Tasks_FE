import { Loader2 } from "lucide-react";
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
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: colors.greenMid }} />
            <span className="body-sm" style={{ color: colors.textMuted }}>{label}</span>
        </div>
    );
}
