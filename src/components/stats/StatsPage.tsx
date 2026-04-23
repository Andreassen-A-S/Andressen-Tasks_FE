"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import TrendChart from "@/components/stats/TrendChart";
import PriorityChart from "@/components/stats/PriorityChart";
import TopPerformersTable from "@/components/stats/TopPerformersTable";
import StatsLoadingState from "./StatsLoadingState";
import StatsErrorState from "./StatsErrorState";
import StatsHeader from "./StatsHeader";
import StatsOverviewCards from "./StatsOverviewCards";
import CompletionMetrics from "./CompletionMetrics";
import RecurringStatsCards from "./RecurringStatsCards";
import StatusDistribution from "./StatusDistribution";
import AverageCompletionTime from "./AverageCompletionTime";
import { adminQueryKeys } from "@/lib/queries/admin";
import { getDashboardStats } from "@/lib/api";

export default function StatsPage() {
    const queryClient = useQueryClient();
    const { data: stats, isPending, error } = useQuery({
        queryKey: adminQueryKeys.statsPage,
        queryFn: getDashboardStats,
    });

    if (isPending) {
        return <StatsLoadingState />;
    }

    if (error) {
        return <StatsErrorState error={error instanceof Error ? error.message : undefined} onRetry={() => queryClient.invalidateQueries({ queryKey: adminQueryKeys.statsPage })} />;
    }

    if (!stats) {
        return <StatsErrorState onRetry={() => queryClient.invalidateQueries({ queryKey: adminQueryKeys.statsPage })} />;
    }

    return (
        <div className="min-h-screen">
            <StatsHeader onRefresh={() => queryClient.invalidateQueries({ queryKey: adminQueryKeys.statsPage })} />

            <div className="mx-8 mt-3 px-4 sm:px-6 lg:px-8 pb-12">
                <StatsOverviewCards stats={stats} />
                <CompletionMetrics completion={stats.completion} />

                <div className="my-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TrendChart data={stats.trends} />
                    <PriorityChart data={stats.priority} />
                </div>

                <RecurringStatsCards recurring={stats.recurring} />

                <div className="my-6">
                    <TopPerformersTable data={stats.top_performers} />
                </div>

                <StatusDistribution status={stats.status} />
                <AverageCompletionTime days={stats.completion.avg_completion_days} />
            </div>
        </div>
    );
}
