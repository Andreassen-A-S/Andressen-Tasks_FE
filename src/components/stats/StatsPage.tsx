"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";
import type { DashboardStats } from "@/types/stats";
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

export default function StatsPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadStats() {
            try {
                setLoading(true);
                const data = await getDashboardStats();
                setStats(data);
                setError(null);
            } catch (err) {
                console.error("Failed to load stats:", err);
                setError(err instanceof Error ? err.message : "Failed to load statistics");
            } finally {
                setLoading(false);
            }
        }

        loadStats();
    }, []);

    if (loading) {
        return <StatsLoadingState />;
    }

    if (error) {
        return <StatsErrorState error={error} onRetry={() => window.location.reload()} />;
    }

    if (!stats) {
        return <StatsErrorState onRetry={() => window.location.reload()} />;
    }

    return (
        <div className="min-h-screen">
            <StatsHeader onRefresh={() => window.location.reload()} />

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
