import type { TopPerformer } from "@/types/stats";
import TopPerformersTable from "./TopPerformersTable";

interface LeaderboardStatsTabProps {
    data: TopPerformer[];
    periodLabel: string;
}

export default function LeaderboardStatsTab({ data, periodLabel }: LeaderboardStatsTabProps) {
    return <TopPerformersTable data={data} periodLabel={periodLabel} />;
}
