import type { DashboardStats } from "@/types/stats";
import StatCard from "./StatCard";

interface StatsOverviewCardsProps {
    stats: DashboardStats;
}

export default function StatsOverviewCards({ stats }: StatsOverviewCardsProps) {
    return (
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
                subtitle={`${stats.completion.today_rate}% fuldførelsesrate`}
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
    );
}
