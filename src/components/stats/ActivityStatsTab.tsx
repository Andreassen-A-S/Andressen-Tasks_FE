import type { DashboardStats } from "@/types/stats";
import StatsOverviewPanel from "./StatsOverviewPanel";
import TrendChart from "./TrendChart";

interface ActivityStatsTabProps {
    stats: DashboardStats;
    periodDays: number;
    periodLabel: string;
}

export default function ActivityStatsTab({ stats, periodDays, periodLabel }: ActivityStatsTabProps) {
    return (
        <div className="space-y-6">
            <StatsOverviewPanel stats={stats} periodLabel={periodLabel} />
            <TrendChart data={stats.trends} periodDays={periodDays} />
        </div>
    );
}
