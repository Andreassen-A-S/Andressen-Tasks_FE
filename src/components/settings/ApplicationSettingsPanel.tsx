"use client";

import { getUserRoleLabel, isAdminRole, type User, UserRole } from "@/types/users";
import { colors } from "@/constants/colors";
import SettingsSection from "./SettingsSection";
import SettingsRow from "./SettingsRow";
import { useTheme, type Theme } from "@/hooks/useTheme";
import OrgSettingsSection from "./OrgSettingsSection";
import PositionsSettingsSection from "./PositionsSettingsSection";
import { useAuth } from "@/hooks/useAuth";

const THEMES: { value: Theme; label: string; description: string }[] = [
    { value: "light", label: "Lys", description: "Lys sidebar og indhold" },
    { value: "mix", label: "Mix", description: "Mørk sidebar, lys indhold" },
    { value: "dark", label: "Mørk", description: "Mørk sidebar og indhold" },
];

export default function ApplicationSettingsPanel({ user }: { user: User }) {
    const { theme, setTheme } = useTheme();
    const { contextOrgId } = useAuth();

    const isAdmin = isAdminRole(user.role);
    const hasOrg = !!(user.organization_id || contextOrgId);
    const isSuperAdminPlatformContext = user.role === UserRole.SUPER_ADMIN && !contextOrgId;

    return (
        <div className="space-y-2">
            {isAdmin && hasOrg && (
                <OrgSettingsSection user={user} />
            )}

            <SettingsSection
                title="Panel"
                description="Systeminformation om det aktuelle admin-panel."
            >
                <SettingsRow
                    label="App navn"
                    value="MesterPlan"
                    description="Bruges i sidebaren og som intern identitet for panelet."
                />
                <SettingsRow
                    label="Aktuel administrator"
                    value={`${user.name} · ${getUserRoleLabel(user.role)}`}
                    description="Den konto der er logget ind lige nu."
                />
            </SettingsSection>

            <SettingsSection
                title="Medarbejdere"
                description="De eneste medarbejderstandarder der betyder noget i UI'et lige nu."
            >
                <SettingsRow
                    label="Standardrolle"
                    value={getUserRoleLabel(UserRole.USER)}
                    description="Nye medarbejdere starter som brugere, medmindre en administrator vælger andet."
                />
            </SettingsSection>

            {isAdmin && hasOrg && !isSuperAdminPlatformContext && (
                <PositionsSettingsSection />
            )}

            <SettingsSection
                title="Udseende"
                description="Vælg et farvetema til admin-panelet. Gælder kun denne browser."
            >
                <div className="rounded-lg border px-4 py-3" style={{ borderColor: colors.border, backgroundColor: colors.white }}>
                    <p className="label-lg mb-3" style={{ color: colors.textPrimary }}>Tema</p>
                    <div className="flex gap-3">
                        {THEMES.map(({ value, label, description }) => {
                            const isActive = theme === value;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setTheme(value)}
                                    className="flex-1 rounded-lg border px-3 py-3 text-left transition-colors cursor-pointer"
                                    style={{
                                        borderColor: isActive ? colors.green : colors.border,
                                        backgroundColor: isActive ? colors.greenLight : "transparent",
                                    }}
                                >
                                    <p className="label-md" style={{ color: isActive ? colors.green : colors.textPrimary }}>{label}</p>
                                    <p className="caption mt-0.5" style={{ color: colors.textMuted }}>{description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection
                title="System"
                description="Read-only miljøoplysninger, nyttige ved fejlsøgning."
            >
                <SettingsRow
                    label="API endpoint"
                    value={process.env.NEXT_PUBLIC_API_URL || "Ikke sat"}
                    description="Frontendens aktuelle backend-endpoint."
                />
                <SettingsRow
                    label="Tidszone"
                    value="Europe/Copenhagen"
                    description="Datoer og opgaver behandles efter dansk driftstid."
                />
            </SettingsSection>
        </div>
    );
}
