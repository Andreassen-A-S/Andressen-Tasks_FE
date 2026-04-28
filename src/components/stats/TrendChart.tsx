import { formatLocalDate, formatNumber } from "@/helpers/helpers";
import type { TrendDataPoint } from "@/types/stats";
import { colors } from "@/constants/colors";
import DataBarChart from "@/components/common/chart/DataBarChart";

interface TrendChartProps {
    data: TrendDataPoint[];
    periodDays: number;
}

interface TrendTooltipProps {
    active?: boolean;
    label?: string | number;
    payload?: Array<{
        color?: string;
        dataKey?: string | number;
        name?: string;
        value?: number;
    }>;
}

function TrendTooltip({ active, payload, label }: TrendTooltipProps) {
    if (!active || !payload?.length) return null;

    return (
        <div
            className="rounded-lg border px-3 py-2 shadow-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.white }}
        >
            <p className="label-md mb-1" style={{ color: colors.textPrimary }}>
                {formatLocalDate(String(label), "da-DK", { day: "numeric", month: "short" })}
            </p>
            {payload.map(item => (
                <div key={item.dataKey} className="flex items-center justify-between gap-6 body-sm">
                    <span style={{ color: item.color }}>{item.name}</span>
                    <span className="label-md" style={{ color: colors.textPrimary }}>{item.value}</span>
                </div>
            ))}
        </div>
    );
}

export default function TrendChart({ data, periodDays }: TrendChartProps) {
    const formatDate = (dateStr: string) => {
        return formatLocalDate(dateStr, "da-DK", { month: "short", day: "numeric" });
    };
    const xTickInterval = data && data.length > 24 ? 4 : data && data.length > 12 ? 2 : 0;

    return (
        <DataBarChart
            data={data ?? []}
            xDataKey="date"
            series={[
                { key: "created", name: "Oprettet", color: colors.blue },
                { key: "completed", name: "Fuldført", color: colors.green },
            ]}
            xTickFormatter={formatDate}
            xTickInterval={xTickInterval}
            cursor
            tooltipContent={<TrendTooltip />}
            toolbar={
                <>
                    <div>
                        <h3 className="h4">Aktivitet over tid</h3>
                        <p className="body-sm" style={{ color: colors.textMuted }}>
                            Daglig aktivitet for de sidste {formatNumber(periodDays)} dage
                        </p>
                    </div>
                    <div className="flex items-center gap-4 label-md" aria-label="Forklaring">
                        <span className="inline-flex items-center gap-1.5" style={{ color: colors.textSecondary }}>
                            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: colors.green }} />
                            Fuldført
                        </span>
                        <span className="inline-flex items-center gap-1.5" style={{ color: colors.textSecondary }}>
                            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: colors.blue }} />
                            Oprettet
                        </span>
                    </div>
                </>
            }
            emptyState={
                <p className="body-md text-center py-8" style={{ color: colors.textMuted }}>
                    Ingen trenddata tilgængelig
                </p>
            }
        />
    );
}
