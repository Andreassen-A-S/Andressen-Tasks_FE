"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSessions, revokeSession, revokeAllSessions } from "@/lib/api/auth";
import { useAuth } from "@/hooks/useAuth";
import type { ActiveSession } from "@/types/auth";
import SettingsSection from "./SettingsSection";
import DataTable from "@/components/common/table/DataTable";
import DropdownMenu from "@/components/common/DropdownMenu";
import Button from "@/components/common/buttons/Button";
import ConfirmModal from "@/components/common/ConfirmModal";
import { colors } from "@/constants/colors";
import Pill from "@/components/common/label/Pill";
import Banner from "@/components/common/Banner";
import { EllipsisVertical } from "lucide-react";
import { toast } from "sonner";

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString("da-DK", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

const columns = [
    { key: "device", header: "Enhed", className: "px-6 py-2.5 label-sm" },
    { key: "location", header: "Lokation", className: "px-6 py-2.5 label-sm" },
    { key: "created", header: "Oprettet", className: "px-6 py-2.5 label-sm" },
    { key: "last_used", header: "Opdateret", className: "px-6 py-2.5 label-sm" },
    { key: "actions", header: "", className: "py-2.5 w-px pr-4" },
];

function SessionRow({ session, onRevoke, onLogout, revoking }: {
    session: ActiveSession;
    onRevoke: (session: ActiveSession) => void;
    onLogout: () => void;
    revoking: boolean;
}) {
    return (
        <tr>
            <td className="px-6 py-3">
                <div className="flex items-center gap-2">
                    <span className="label-md" style={{ color: colors.textPrimary }}>
                        {session.label ?? (session.type === "browser" ? "Browser" : "Mobilapp")}
                    </span>
                    {session.current && <Pill color="green">Nuværende</Pill>}
                </div>
            </td>
            <td className="px-6 py-3 body-sm" style={{ color: session.location ? colors.textSecondary : colors.textMuted }}>
                {session.location ?? "—"}
            </td>
            <td className="px-6 py-3 body-sm" style={{ color: colors.textSecondary }}>
                {formatDate(session.created_at)}
            </td>
            <td className="px-6 py-3 body-sm" style={{ color: colors.textSecondary }}>
                {formatDate(session.last_used_at)}
            </td>
            <td className="py-3 pr-4 w-px">
                <DropdownMenu
                    trigger={<Button tooltip="Session handlinger" variant="ghost" size="sm" icon={<EllipsisVertical className="w-4 h-4" />} iconOnly />}
                    items={[
                        {
                            label: session.current ? "Log ud" : "Afbryd",
                            onClick: session.current ? onLogout : () => onRevoke(session),
                            danger: true,
                            disabled: revoking,
                        },
                    ]}
                />
            </td>
        </tr>
    );
}

export default function SessionsSettingsSection() {
    const queryClient = useQueryClient();
    const { logout } = useAuth();
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

    const { data: sessions, isLoading, isError } = useQuery({
        queryKey: ["auth-sessions"],
        queryFn: getSessions,
    });

    const { mutate: revoke } = useMutation({
        mutationFn: (session: ActiveSession) => revokeSession(session.id),
        onMutate: (session) => setRevokingId(session.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth-sessions"] });
            toast.success("Session tilbagekaldt");
        },
        onError: () => toast.error("Kunne ikke tilbagekalde session. Prøv igen."),
        onSettled: () => setRevokingId(null),
    });

    const { mutate: revokeAll, isPending: revokingAll } = useMutation({
        mutationFn: revokeAllSessions,
        onSuccess: () => logout(),
        onError: () => toast.error("Kunne ikke logge ud af alle enheder. Prøv igen."),
    });

    const hasOtherSessions = (sessions?.length ?? 0) > 1 || sessions?.some(s => !s.current);

    return (
        <SettingsSection
            title="Aktive sessioner"
            description="Browsere og mobilapps hvor du er logget ind med din konto."
        >
            {isError && (
                <Banner variant="warning">
                    Sessioner kunne ikke indlæses. Prøv igen, eller genindlæs siden.
                </Banner>
            )}

            {isLoading && (
                <p className="body-sm" style={{ color: colors.textMuted }}>Indlæser sessioner...</p>
            )}

            {!isLoading && !isError && sessions?.length === 0 && (
                <p className="body-sm" style={{ color: colors.textMuted }}>Ingen aktive sessioner fundet.</p>
            )}

            {!isLoading && !isError && sessions && sessions.length > 0 && (
                <>
                    {hasOtherSessions && (
                        <div className="flex justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => setConfirmRevokeAll(true)}
                                disabled={revokingAll}
                            >
                                Log ud af alle enheder
                            </Button>
                        </div>
                    )}
                    <DataTable columns={columns}>
                        {sessions.map((session) => (
                            <SessionRow
                                key={session.id}
                                session={session}
                                onRevoke={revoke}
                                onLogout={logout}
                                revoking={revokingId === session.id}
                            />
                        ))}
                    </DataTable>
                </>
            )}

            <ConfirmModal
                isOpen={confirmRevokeAll}
                onClose={() => setConfirmRevokeAll(false)}
                title="Log ud af alle enheder"
                description="Er du sikker på, at du vil logge ud af alle enheder?"
                confirmLabel="Log ud af alle"
                onConfirm={() => { setConfirmRevokeAll(false); revokeAll(); }}
                danger
            />
        </SettingsSection>
    );
}
