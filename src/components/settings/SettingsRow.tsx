import { colors } from "@/constants/colors";
import Pill from "@/components/common/label/Pill";

interface SettingsRowProps {
    label: string;
    value?: React.ReactNode;
    description?: string;
    badge?: string;
}

export default function SettingsRow({ label, value, description, badge }: SettingsRowProps) {
    return (
        <div className="rounded-lg border bg-surface px-4 py-3" style={{ borderColor: colors.border }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <p className="label-lg" style={{ color: colors.textPrimary }}>
                        {label}
                    </p>
                    {description && (
                        <p className="body-sm mt-1" style={{ color: colors.textSecondary }}>
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {value && (
                        <div className="label-md text-left sm:text-right" style={{ color: colors.textSecondary }}>
                            {value}
                        </div>
                    )}
                    {badge && <Pill color="yellow">{badge}</Pill>}
                </div>
            </div>
        </div>
    );
}
