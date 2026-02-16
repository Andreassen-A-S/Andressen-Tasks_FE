"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";
import type { DashboardStats } from "@/types/stats";
import StatCard from "@/components/stats/StatCard";
import TrendChart from "@/components/stats/TrendChart";
import PriorityChart from "@/components/stats/PriorityChart";
import TopPerformersTable from "@/components/stats/TopPerformersTable";

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
        return (
            <div className="min-h-screen bg-white">
                <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
                    <div className="animate-pulse space-y-6">
                        {/* Header skeleton */}
                        <div className="h-8 bg-gray-200 rounded w-64"></div>

                        {/* Cards skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>

                        {/* Charts skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-96 bg-gray-200 rounded-lg"></div>
                            <div className="h-96 bg-gray-200 rounded-lg"></div>
                        </div>

                        {/* Table skeleton */}
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                        <div className="h2 text-red-600 mb-2">
                            Kunne ikke hente statistik
                        </div>
                        <p className="body-md text-red-700 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-lg px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Prøv igen
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-white">
                <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
                        <p className="body-md text-gray-500">Ingen statistik tilgængelig</p>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate completion rate for today
    const todayCompletionRate = stats.completion.today_rate;

    return (
        <div className="min-h-screen">
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="h1 flex items-center gap-3">Statistik</h1>
                        <p className="body-sm">Oversigt over opgaver og aktiviteter</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex btn-lg items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Opdater
                    </button>
                </div>

                {/* Overview Cards */}
                <div className="my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Opgaver i alt"
                        value={stats.overview.total_tasks}
                        variant="default"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Fuldført i dag"
                        value={stats.overview.completed_today}
                        variant="success"
                        subtitle={`${todayCompletionRate}% fuldførelsesrate`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Mangler"
                        value={stats.overview.pending_tasks}
                        variant="warning"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Forfaldne"
                        value={stats.overview.overdue_tasks}
                        variant="danger"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>

                {/* Completion Metrics */}
                <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="I dag"
                        value={`${stats.completion.today_rate}%`}
                        subtitle="Fuldførelsesrate"
                        tooltip="Procent af opgaver oprettet i dag, som er blevet færdiggjort. Beregnes som: (Færdige i dag / Oprettet i dag) × 100"
                    />
                    <StatCard
                        title="Denne uge"
                        value={`${stats.completion.week_rate}%`}
                        subtitle="Fuldførelsesrate"
                        tooltip="Færdiggørelsesrate for denne uge (mandag-søndag). Viser hvor mange procent af ugens opgaver der er blevet færdiggjort"
                    />
                    <StatCard
                        title="Denne måned"
                        value={`${stats.completion.month_rate}%`}
                        subtitle="Fuldførelsesrate"
                        tooltip="Færdiggørelsesrate for den nuværende måned. Beregnes som: (Færdige denne måned / Oprettet denne måned) × 100"
                    />
                </div>

                {/* Charts Row */}
                <div className="my-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TrendChart data={stats.trends} />
                    <PriorityChart data={stats.priority} />
                </div>

                {/* Recurring Stats */}
                <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Aktive skabeloner"
                        value={stats.recurring.active_templates}
                        subtitle="Gentagne opgaver"
                        variant="default"
                        tooltip="Antal gentagende opgaveskabeloner, der i øjeblikket er aktive og genererer nye opgaveinstanser"
                    />
                    <StatCard
                        title="Kommende opgaver"
                        value={stats.recurring.upcoming_instances}
                        subtitle="Næste 7 dage"
                        variant="warning"
                        tooltip="Afventende gentagende opgaveinstanser planlagt inden for de næste 7 dage, som ikke er blevet færdiggjort endnu"
                    />
                    <StatCard
                        title="Fuldførelsesrate"
                        value={`${stats.recurring.completion_rate}%`}
                        subtitle="Gentagende opgaver"
                        variant="success"
                        tooltip="Hvor mange procent af alle gentagende opgaveinstanser er blevet færdiggjort. Beregnes som: (Færdige instanser / Totale instanser) × 100"
                    />
                </div>

                {/* Top Performers */}
                <div className="my-6">
                    <TopPerformersTable data={stats.top_performers} />
                </div>

                {/* Status Distribution */}
                <div className="my-6 rounded-lg border border-gray-200 bg-white p-6">
                    <h3 className="h3 mb-6">Statusfordeling</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-yellow-50">
                            <p className="h2 text-yellow-600">{stats.status.pending}</p>
                            <p className="label-md text-yellow-700 mt-1">Mangler</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-blue-50">
                            <p className="h2 text-blue-600">{stats.status.in_progress}</p>
                            <p className="label-md text-blue-700 mt-1">I gang</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-green-50">
                            <p className="h2 text-green-600">{stats.status.completed}</p>
                            <p className="label-md text-green-700 mt-1">Fuldført</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-gray-50">
                            <p className="h2 text-gray-600">{stats.status.archived}</p>
                            <p className="label-md text-gray-700 mt-1">Arkiveret</p>
                        </div>
                    </div>
                </div>

                {/* Average Completion Time */}
                <div className="my-6 rounded-lg border border-gray-200 bg-white p-6 text-center">
                    <p className="label-md text-gray-600 mb-2">Gennemsnitlig fuldførelsestid</p>
                    <p className="h1 text-gray-900">
                        {stats.completion.avg_completion_days}
                        <span className="h4 text-gray-600 ml-2">dage</span>
                    </p>
                </div>
            </div>
        </div>
    );
}