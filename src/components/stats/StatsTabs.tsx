import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faTrophy } from "@fortawesome/free-solid-svg-icons";
import ProjectIcon from "@/components/common/icons/ProjectIcon";
import { colors } from "@/constants/colors";

export type StatsTab = "performance" | "leaderboard" | "projects";

interface StatsTabsProps {
    activeTab: StatsTab;
    onChange: (tab: StatsTab) => void;
}

const tabs: Array<{ id: StatsTab; label: string; icon: React.ReactNode }> = [
    { id: "performance", label: "Aktivitet", icon: <FontAwesomeIcon icon={faArrowTrendUp} className="h-4 w-4" /> },
    { id: "leaderboard", label: "Leaderboard", icon: <FontAwesomeIcon icon={faTrophy} className="h-4 w-4" /> },
    { id: "projects", label: "Projekter", icon: <ProjectIcon className="h-4 w-4" /> },
];

export default function StatsTabs({ activeTab, onChange }: StatsTabsProps) {
    return (
        <div
            role="tablist"
            className="inline-flex rounded-lg border p-1"
            style={{ borderColor: colors.border, backgroundColor: colors.white }}
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
                        className="inline-flex items-center gap-2 rounded-md px-4 py-2 label-md transition-colors"
                        style={{
                            backgroundColor: active ? colors.charcoal : "transparent",
                            color: active ? colors.textWhite : colors.textSecondary,
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
