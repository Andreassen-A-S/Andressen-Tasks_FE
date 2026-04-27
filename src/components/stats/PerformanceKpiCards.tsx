import { colors } from "@/constants/colors";
import type { DashboardStats } from "@/types/stats";

interface PerformanceKpiCardsProps {
    stats: DashboardStats;
    periodLabel: string;
}

const cardStyle = {
    borderColor: colors.border,
    backgroundColor: colors.white,
};

export default function PerformanceKpiCards({ stats, periodLabel }: PerformanceKpiCardsProps) {
    const cards = [
        {
            label: "Til tiden",
            value: `${stats.completion.on_time_rate}%`,
            detail: `${stats.completion.on_time_completed} af ${stats.completion.completed_this_month} afsluttet ${periodLabel.toLowerCase()}`,
            accent: colors.green,
        },
        {
            label: "Afslutninger",
            value: stats.completion.completed_this_month,
            detail: `Opgaver afsluttet ${periodLabel.toLowerCase()}`,
            accent: colors.blue,
        },
        {
            label: "Gns. færdiggørelse",
            value: `${stats.completion.avg_completion_days}d`,
            detail: "Fra oprettelse til afslutning",
            accent: colors.charcoal,
        },
        {
            label: "Gns. forsinkelse",
            value: `${stats.completion.avg_delay_days}d`,
            detail: "Kun for opgaver afsluttet efter deadline",
            accent: stats.completion.avg_delay_days > 0 ? colors.red : colors.green,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map(card => (
                <div
                    key={card.label}
                    className="rounded-xl border p-5"
                    style={cardStyle}
                >
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: card.accent }} />
                        <p className="label-md" style={{ color: colors.textSecondary }}>{card.label}</p>
                    </div>
                    <p className="mt-3 h1" style={{ color: colors.textPrimary }}>{card.value}</p>
                    <p className="mt-1 body-sm" style={{ color: colors.textMuted }}>{card.detail}</p>
                </div>
            ))}
        </div>
    );
}
