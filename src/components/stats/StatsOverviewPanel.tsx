import {
    faCircleCheck,
    faClock,
    faExclamationTriangle,
    faListCheck,
    faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { colors } from "@/constants/colors";
import type { DashboardStats } from "@/types/stats";
import StatsPanel from "./StatsPanel";
import { formatNumber } from "@/helpers/helpers";

interface StatsOverviewPanelProps {
    stats: DashboardStats;
    periodLabel: string;
}

function getPercent(value: number, total: number) {
    if (total <= 0) return 0;
    return Math.max(0, (value / total) * 100);
}

export default function StatsOverviewPanel({ stats, periodLabel }: StatsOverviewPanelProps) {
    const created = stats.trends.reduce((sum, item) => sum + item.created, 0);
    const completed = stats.trends.reduce((sum, item) => sum + item.completed, 0);
    const active = stats.overview.pending_tasks;
    const overdue = stats.overview.overdue_tasks;
    const total = Math.max(created + completed + active + overdue, 1);

    const summaryItems = [
        {
            label: "Aktive opgaver",
            value: active,
            icon: faListCheck,
            color: colors.blue,
            background: colors.blueLight,
        },
        {
            label: "Fuldført",
            value: completed,
            icon: faCircleCheck,
            color: colors.green,
            background: colors.greenLight,
        },
        {
            label: "Oprettet",
            value: created,
            icon: faPlusCircle,
            color: colors.charcoal,
            background: colors.muted,
        },
        {
            label: "Overskredne",
            value: overdue,
            icon: faExclamationTriangle,
            color: colors.red,
            background: colors.redLight,
        },
    ];

    const barSegments = [
        { label: "Fuldført", value: completed, color: colors.green },
        { label: "Oprettet", value: created, color: colors.blue },
        { label: "Aktive", value: active, color: colors.charcoal },
        { label: "Overskredne", value: overdue, color: colors.red },
    ].filter(segment => segment.value > 0);

    return (
        <StatsPanel
            title="Overblik"
            subtitle={`Opgaveaktivitet for ${periodLabel.toLowerCase()}`}
            action={
                <div className="inline-flex items-center gap-2 label-md" style={{ color: colors.textSecondary }}>
                    <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5" />
                    {formatNumber(stats.completion.on_time_rate)}% til tiden
                </div>
            }
            contentClassName="grid gap-5 p-5 lg:grid-cols-[1fr_1fr] lg:items-center"
        >
                <div>
                    <div className="flex h-3 overflow-hidden rounded-full border" style={{ borderColor: colors.border }}>
                        {barSegments.length > 0 ? (
                            barSegments.map(segment => (
                                <div
                                    key={segment.label}
                                    aria-label={`${segment.label}: ${segment.value}`}
                                    className="h-full"
                                    style={{
                                        width: `${getPercent(segment.value, total)}%`,
                                        minWidth: getPercent(segment.value, total) > 0 ? 6 : 0,
                                        backgroundColor: segment.color,
                                    }}
                                />
                            ))
                        ) : (
                            <div className="h-full w-full" style={{ backgroundColor: colors.muted }} />
                        )}
                    </div>

                    <p className="mt-4 body-md" style={{ color: colors.textSecondary }}>
                        <span className="label-lg" style={{ color: colors.textPrimary }}>
                            {formatNumber(completed)} opgaver fuldført
                        </span>{" "}
                        og <span className="label-lg" style={{ color: colors.textPrimary }}>{formatNumber(created)} opgaver oprettet</span>{" "}
                        i perioden. Der er {formatNumber(active)} aktive opgaver, hvoraf {formatNumber(overdue)} er overskredne.
                    </p>
                </div>

                <div className="grid grid-cols-2 divide-x divide-y rounded-lg border sm:grid-cols-4 sm:divide-y-0" style={{ borderColor: colors.border }}>
                    {summaryItems.map((item, index) => (
                        <div
                            key={item.label}
                            className={[
                                "min-w-0 px-4 py-4 text-center",
                                index % 2 === 0 ? "border-l-0" : "",
                            ].join(" ")}
                            style={{ borderColor: colors.border }}
                        >
                            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: item.background }}>
                                <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" style={{ color: item.color }} />
                            </div>
                            <p className="h3" style={{ color: colors.textPrimary }}>{formatNumber(item.value)}</p>
                            <p className="label-md" style={{ color: colors.textSecondary }}>{item.label}</p>
                        </div>
                    ))}
                </div>
        </StatsPanel>
    );
}
