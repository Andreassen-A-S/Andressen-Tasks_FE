import type { Metadata } from "next";
import StatsPage from "@/components/stats/StatsPage";

export const metadata: Metadata = { title: "Statistik" };

export default function StatisticsPage() {
    return <StatsPage />;
}