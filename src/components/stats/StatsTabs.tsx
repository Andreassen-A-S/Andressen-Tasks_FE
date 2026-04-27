import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faFolderTree, faTrophy } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { colors } from "@/constants/colors";

export type StatsTab = "performance" | "leaderboard" | "projects";

interface StatsTabsProps {
    activeTab: StatsTab;
    onChange: (tab: StatsTab) => void;
}

const tabs: Array<{ id: StatsTab; label: string; icon: IconDefinition }> = [
    { id: "performance", label: "Aktivitet", icon: faArrowTrendUp },
    { id: "leaderboard", label: "Leaderboard", icon: faTrophy },
    { id: "projects", label: "Projekter", icon: faFolderTree },
];

export default function StatsTabs({ activeTab, onChange }: StatsTabsProps) {
    return (
        <div
            className="inline-flex rounded-lg border p-1"
            style={{ borderColor: colors.border, backgroundColor: colors.white }}
        >
            {tabs.map(tab => {
                const active = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className="inline-flex items-center gap-2 rounded-md px-4 py-2 label-md transition-colors"
                        style={{
                            backgroundColor: active ? colors.charcoal : "transparent",
                            color: active ? colors.textWhite : colors.textSecondary,
                        }}
                    >
                        <FontAwesomeIcon icon={tab.icon} className="h-4 w-4" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
