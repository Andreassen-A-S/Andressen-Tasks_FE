import { TrendingUp, Trophy } from "lucide-react";
import ProjectIcon from "@/components/common/icons/ProjectIcon";

export type StatsTab = "performance" | "leaderboard" | "projects";

interface StatsTabsProps {
    activeTab: StatsTab;
    onChange: (tab: StatsTab) => void;
}

const tabs: Array<{ id: StatsTab; label: string; icon: React.ReactNode }> = [
    { id: "performance", label: "Aktivitet", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="h-4 w-4" /> },
    { id: "projects", label: "Projekter", icon: <ProjectIcon className="h-4 w-4" /> },
];

export default function StatsTabs({ activeTab, onChange }: StatsTabsProps) {
    return (
        <div
            role="tablist"
            className="inline-flex rounded-lg border border-border bg-surface-subtle p-1"
        >
            {tabs.map(tab => {
                const active = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(tab.id)}
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 label-md transition-colors ${
                            active
                                ? "bg-surface text-text-primary shadow-sm"
                                : "text-text-secondary hover:text-text-primary"
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
