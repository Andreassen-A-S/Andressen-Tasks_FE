"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { getPositions, createPosition, deletePosition } from "@/lib/api/positions";
import type { Position } from "@/types/position";
import { colors } from "@/constants/colors";
import SettingsSection from "./SettingsSection";
import TextInput from "@/components/common/forms/TextInput";
import Button from "@/components/common/buttons/Button";
import Modal from "@/components/modal/Modal";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function PositionsSettingsSection() {
    const queryClient = useQueryClient();

    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [adding, setAdding] = useState(false);

    const [confirmTarget, setConfirmTarget] = useState<Position | null>(null);
    const [deleting, setDeleting] = useState(false);

    const { data: positions = [], isLoading } = useQuery({
        queryKey: ["positions"],
        queryFn: getPositions,
    });

    function openCreate() {
        setNewName("");
        setCreateOpen(true);
    }

    async function handleAdd() {
        const trimmed = newName.trim();
        if (!trimmed) return;
        setAdding(true);
        try {
            await createPosition(trimmed);
            queryClient.invalidateQueries({ queryKey: ["positions"] });
            toast.success(`Stilling "${trimmed}" oprettet`);
            setCreateOpen(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Kunne ikke oprette stilling");
        } finally {
            setAdding(false);
        }
    }

    async function handleConfirmDelete() {
        if (!confirmTarget) return;
        setDeleting(true);
        try {
            await deletePosition(confirmTarget.position_id);
            queryClient.invalidateQueries({ queryKey: ["positions"] });
            toast.success(`Stilling "${confirmTarget.name}" slettet`);
            setConfirmTarget(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Kunne ikke slette stilling");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <SettingsSection
                title="Stillinger"
                description="Tilpas de stillinger der kan tildeles medarbejdere i organisationen."
            >
                <div className="rounded-lg border bg-surface px-4 py-4" style={{ borderColor: colors.border }}>
                    <div className="flex items-center justify-between mb-3">
                        <p className="label-lg" style={{ color: colors.textPrimary }}>Aktive stillinger</p>
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={openCreate}
                        >
                            Opret stilling
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-6 w-20 rounded-full bg-surface-subtle animate-pulse" />
                            ))}
                        </div>
                    ) : positions.length === 0 ? (
                        <p className="body-sm" style={{ color: colors.textMuted }}>
                            Ingen stillinger oprettet endnu.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {positions.map((position) => (
                                <span
                                    key={position.position_id}
                                    className="inline-flex items-center gap-1 rounded-full px-2 h-6 label-sm"
                                    style={{
                                        backgroundColor: colors.greenLight,
                                        color: colors.green,
                                        border: `1px solid ${colors.greenMid}`,
                                    }}
                                >
                                    {position.name}
                                    <button
                                        type="button"
                                        aria-label={`Slet ${position.name}`}
                                        onClick={() => setConfirmTarget(position)}
                                        className="rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </SettingsSection>

            <Modal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Opret stilling"
                maxWidth="sm"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" size="md" onClick={() => setCreateOpen(false)} disabled={adding}>
                            Annuller
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            loading={adding}
                            disabled={!newName.trim()}
                            onClick={handleAdd}
                        >
                            Opret stilling
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="body-md" style={{ color: colors.textSecondary }}>
                        Stillingen vil være tilgængelig i medarbejderformularen for hele organisationen.
                    </p>
                    <TextInput
                        placeholder="Fx. Murer, Tømrer, Elektriker…"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                        disabled={adding}
                        autoFocus
                    />
                </div>
            </Modal>

            <ConfirmModal
                isOpen={!!confirmTarget}
                onClose={() => setConfirmTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Slet stilling"
                description={
                    <>
                        Er du sikker på, at du vil slette stillingen <strong>"{confirmTarget?.name}"</strong>?
                        Medarbejdere med denne stilling mister deres tilknytning.
                    </>
                }
                confirmLabel="Slet stilling"
                danger
                loading={deleting}
            />
        </>
    );
}
