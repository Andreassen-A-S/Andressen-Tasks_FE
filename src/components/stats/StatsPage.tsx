"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import StatsLoadingState from "./StatsLoadingState";
import StatsErrorState from "./StatsErrorState";
import StatsHeader from "./StatsHeader";
import StatsTabs, { type StatsTab } from "./StatsTabs";
import ActivityStatsTab from "./ActivityStatsTab";
import LeaderboardStatsTab from "./LeaderboardStatsTab";
import ProjectStatsTab from "./ProjectStatsTab";
import { adminQueryKeys } from "@/lib/queries/admin";
import { getDashboardStats } from "@/lib/api";
import { colors } from "@/constants/colors";
import DropdownMenu from "@/components/common/DropdownMenu";
import Button from "@/components/common/buttons/Button";
import { formatLocalDate } from "@/helpers/helpers";

const PERIOD_OPTIONS = [
    { days: 7, label: "1 uge" },
    { days: 30, label: "30 dage" },
    { days: 90, label: "90 dage" },
] as const;

const TAB_HEADER: Record<StatsTab, { title: string; subtitle: string }> = {
    performance: {
        title: "Aktivitet",
        subtitle: "Oprettede og fuldførte opgaver over tid",
    },
    leaderboard: {
        title: "Leaderboard",
        subtitle: "Medarbejdere med flest afsluttede opgaver",
    },
    projects: {
        title: "Projektoversigt",
        subtitle: "KPI'er pr. projekt og deadline-status",
    },
};

function getDateRangeLabel(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);

    const sameYear = start.getFullYear() === end.getFullYear();
    const startLabel = formatLocalDate(start, "da-DK", {
        day: "numeric",
        month: "long",
        ...(sameYear ? {} : { year: "numeric" }),
    });
    const endLabel = formatLocalDate(end, "da-DK", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return `${startLabel} - ${endLabel}`;
}

export default function StatsPage() {
    const queryClient = useQueryClient();
    const [periodDays, setPeriodDays] = useState(30);
    const [activeTab, setActiveTab] = useState<StatsTab>("performance");
    const selectedPeriod = PERIOD_OPTIONS.find(option => option.days === periodDays) ?? PERIOD_OPTIONS[1];
    const dateRangeLabel = getDateRangeLabel(periodDays);
    const header = TAB_HEADER[activeTab];

    const { data: stats, isPending, error } = useQuery({
        queryKey: [...adminQueryKeys.statsPage, periodDays],
        queryFn: () => getDashboardStats(periodDays),
    });

    const invalidateStats = () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.statsPage });

    if (isPending) {
        return <StatsLoadingState />;
    }

    if (error) {
        return <StatsErrorState error={error instanceof Error ? error.message : undefined} onRetry={invalidateStats} />;
    }

    if (!stats) {
        return <StatsErrorState onRetry={invalidateStats} />;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.eggWhite }}>
            <StatsHeader
                title={header.title}
                subtitle={`${header.subtitle} · ${dateRangeLabel}`}
                periodAction={
                    <>
                        <Button
                            variant="secondary"
                            size="lg"
                            icon={faArrowUpRightFromSquare}
                            iconPosition="right"
                            onClick={() => window.open("/dashboard", "_blank", "noopener,noreferrer")}
                        >
                            Dashboard
                        </Button>
                        <DropdownMenu
                            trigger={
                                <Button variant="secondary" size="lg">
                                    Periode: {selectedPeriod.label}
                                    <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                                </Button>
                            }
                            items={PERIOD_OPTIONS.map(option => ({
                                label: option.label,
                                checked: periodDays === option.days,
                                onClick: () => setPeriodDays(option.days),
                            }))}
                        />
                    </>
                }
            />

            <div className="mx-8 mt-5 px-4 pb-12 sm:px-6 lg:px-8">
                <div className="mb-5">
                    <StatsTabs activeTab={activeTab} onChange={setActiveTab} />
                </div>

                {activeTab === "performance" && (
                    <ActivityStatsTab stats={stats} periodDays={periodDays} periodLabel={selectedPeriod.label} />
                )}
                {activeTab === "leaderboard" && (
                    <LeaderboardStatsTab data={stats.top_performers} periodLabel={selectedPeriod.label} />
                )}
                {activeTab === "projects" && (
                    <ProjectStatsTab data={stats.projects} periodLabel={selectedPeriod.label} />
                )}
            </div>
        </div>
    );
}
