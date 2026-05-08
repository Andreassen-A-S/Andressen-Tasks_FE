import type { Metadata } from "next";
import DashboardPage from "@/components/dashboard/DashboardPage";

export const metadata: Metadata = { title: "Dashboard" };

export default function Dashboard() {
    return <DashboardPage />;
}
