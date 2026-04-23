"use client";

import { getUserRoleLabel, type User, UserRole } from "@/types/users";
import { colors } from "@/constants/colors";
import SettingsSection from "./SettingsSection";
import SettingsRow from "./SettingsRow";
import { UserPositions } from "@/types/users";

export default function ApplicationSettingsPanel({ user }: { user: User }) {
    return (
        <div className="space-y-2">
            <SettingsSection
                title="Organisation"
                description="Det der vises i admin-panelet i dag."
            >
                <SettingsRow
                    label="App navn"
                    value="Andreassen A/S"
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
                <div className="rounded-lg border bg-white px-4 py-3" style={{ borderColor: colors.border }}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="label-lg" style={{ color: colors.textPrimary }}>
                                Stillinger
                            </p>
                            <p className="body-sm mt-1" style={{ color: colors.textSecondary }}>
                                Listen bruges i medarbejderformularen, men er stadig hardcoded.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {UserPositions.map((position) => (
                                    <span
                                        key={position}
                                        className="badge badge-md rounded-full px-3 py-1"
                                        style={{ backgroundColor: colors.greenLight, color: colors.green }}
                                    >
                                        {position}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <span
                            className="badge badge-md rounded-full px-3 py-1"
                            style={{ backgroundColor: colors.yellowLight, color: colors.yellow }}
                        >
                            Bør flyttes til backend
                        </span>
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
