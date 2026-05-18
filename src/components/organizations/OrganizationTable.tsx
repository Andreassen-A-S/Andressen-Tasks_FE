"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteOrganization } from "@/lib/api/organizations";
import type { Organization } from "@/types/organization";
import DataTable from "@/components/common/table/DataTable";
import Modal from "@/components/modal/Modal";
import Button from "@/components/common/buttons/Button";
import ConfirmModal from "@/components/common/ConfirmModal";
import OrganizationRow from "./OrganizationRow";
import UpdateOrganizationForm from "./UpdateOrganizationForm";

interface OrganizationTableProps {
    organizations: Organization[];
    onUpdate: () => void;
    onDelete: () => void;
}

const columns = [
    { key: "name", header: "Navn", className: "px-6 py-2.5 label-sm min-w-[200px]" },
    { key: "slug", header: "Slug", className: "px-6 py-2.5 label-sm" },
    { key: "orgStatus", header: "Org status", className: "px-6 py-2.5 label-sm whitespace-nowrap" },
    { key: "subscriptionStatus", header: "Abonnement", className: "px-6 py-2.5 label-sm whitespace-nowrap" },
    { key: "created", header: "Oprettet", className: "px-6 py-2.5 label-sm" },
    { key: "actions", header: "", className: "py-2.5 w-px pr-4" },
];

export default function OrganizationTable({ organizations, onUpdate, onDelete }: OrganizationTableProps) {
    const [selected, setSelected] = useState<Organization | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const pendingDeleteOrg = organizations.find(o => o.org_id === pendingDeleteId);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const editFormId = "edit-organization-form";

    function handleEdit(org: Organization) {
        setSelected(org);
        setShowEditModal(true);
    }

    function handleDelete(orgId: string) {
        setPendingDeleteId(orgId);
        setConfirmOpen(true);
    }

    async function handleConfirmDelete() {
        if (!pendingDeleteId) return;
        setDeleteLoading(true);
        try {
            await deleteOrganization(pendingDeleteId);
            onDelete();
            setConfirmOpen(false);
            setPendingDeleteId(null);
        } catch {
            toast.error("Kunne ikke slette organisationen. Prøv igen.");
        } finally {
            setDeleteLoading(false);
        }
    }

    if (organizations.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="h3 mb-2">Ingen organisationer fundet</h3>
                <p className="body-md text-text-muted">Opret den første organisation for at komme i gang.</p>
            </div>
        );
    }

    return (
        <>
            <DataTable columns={columns}>
                {organizations.map((org) => (
                    <OrganizationRow
                        key={org.org_id}
                        organization={org}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </DataTable>

            <Modal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setSelected(null); }}
                title="Rediger organisation"
                maxWidth="sm"
                footer={
                    <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                        <Button type="submit" form={editFormId} loading={editLoading} variant="primary" size="md">
                            Opdater
                        </Button>
                        <Button type="button" onClick={() => { setShowEditModal(false); setSelected(null); }} disabled={editLoading} variant="secondary" size="md">
                            Annuller
                        </Button>
                    </div>
                }
            >
                {selected && (
                    <UpdateOrganizationForm
                        formId={editFormId}
                        organization={selected}
                        onLoadingChange={setEditLoading}
                        onSuccess={() => { setShowEditModal(false); setSelected(null); onUpdate(); }}
                    />
                )}
            </Modal>

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
                onConfirm={handleConfirmDelete}
                title="Slet organisation"
                description={
                    pendingDeleteOrg?._count?.users
                        ? `Denne organisation har ${pendingDeleteOrg._count.users} ${pendingDeleteOrg._count.users === 1 ? "medarbejder" : "medarbejdere"} som mister deres organisationstilknytning. Er du sikker på, at du vil fortsætte?`
                        : "Er du sikker på, at du vil slette denne organisation? Dette kan ikke fortrydes."
                }
                confirmLabel="Slet"
                cancelLabel="Annuller"
                danger
                loading={deleteLoading}
            />
        </>
    );
}
