"use client";

import { use, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Building2, Check, Copy, Ellipsis, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";
import { getOrganization, deleteOrganization } from "@/lib/api/organizations";
import { getUsers, deleteUser } from "@/lib/api/users";
import type { User } from "@/types/users";
import { getProjects } from "@/lib/api/projects";
import { getTasks } from "@/lib/api/tasks";
import { type Organization } from "@/types/organization";
import { organizationStatusLabels, subscriptionStatusLabels, orgStatusColor } from "./organizationDisplay";
import { getUserRoleLabel, UserStatus, UserRole } from "@/types/users";
import { colors } from "@/constants/colors";
import { formatDateTime, formatCommentDate } from "@/helpers/helpers";
import Button from "@/components/common/buttons/Button";
import DropdownMenu from "@/components/common/DropdownMenu";
import Pill from "@/components/common/label/Pill";
import Modal from "@/components/modal/Modal";
import ConfirmModal from "@/components/common/ConfirmModal";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import TaskAssignedUsers from "@/components/common/label/TaskAssignedUsers";
import DetailsSectionHeader from "@/components/common/DetailsSectionHeader";
import DataTable from "@/components/common/table/DataTable";
import UpdateOrganizationForm from "./UpdateOrganizationForm";
import UpdateEmployeeForm from "@/components/employees/UpdateEmployeeForm";
import { toast } from "sonner";
import PageContainer from "@/components/layout/PageContainer";

interface Props {
    paramsPromise: Promise<{ id: string }>;
}



export default function OrganizationDetailsPage({ paramsPromise }: Props) {
    const { id } = use(paramsPromise);
    const router = useRouter();
    const queryClient = useQueryClient();
    const { userRole } = useAuth();
    const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

    const [showEditModal, setShowEditModal] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [selectedMember, setSelectedMember] = useState<User | null>(null);
    const [showEditMemberModal, setShowEditMemberModal] = useState(false);
    const [editMemberLoading, setEditMemberLoading] = useState(false);
    const [confirmDeleteMemberOpen, setConfirmDeleteMemberOpen] = useState(false);
    const [deleteMemberLoading, setDeleteMemberLoading] = useState(false);
    const editMemberFormId = "edit-member-form";
    const [linkCopied, setLinkCopied] = useState(false);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const editFormId = "edit-org-details-form";

    const { data: org, isLoading, isError } = useQuery<Organization>({
        queryKey: ["organizations", id],
        queryFn: () => getOrganization(id),
    });

    const { data: allUsers = [] } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });
    const members = allUsers.filter((u) => u.organization_id === id);

    const { data: allProjects = [] } = useQuery({
        queryKey: ["projects"],
        queryFn: getProjects,
    });
    const projects = allProjects.filter((p) => p.organization_id === id);

    const { data: allTasks = [] } = useQuery({
        queryKey: ["tasks"],
        queryFn: getTasks,
    });

    function getProjectLastActivity(projectId: string): string {
        const projectTasks = allTasks.filter((t) => t.project_id === projectId);
        if (projectTasks.length === 0) return projects.find((p) => p.project_id === projectId)?.updated_at ?? "";
        return new Date(Math.max(...projectTasks.map((t) => new Date(t.updated_at).getTime()))).toISOString();
    }

    const handleUpdated = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["organizations", id] });
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        setShowEditModal(false);
    }, [queryClient, id]);

    async function handleConfirmDelete() {
        setDeleteLoading(true);
        try {
            await deleteOrganization(id);
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
            router.push("/organizations");
        } catch {
            toast.error("Kunne ikke slette organisationen. Prøv igen.");
        } finally {
            setDeleteLoading(false);
        }
    }

    async function handleConfirmDeleteMember() {
        if (!selectedMember) return;
        setDeleteMemberLoading(true);
        try {
            await deleteUser(selectedMember.user_id);
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setConfirmDeleteMemberOpen(false);
            setSelectedMember(null);
        } catch {
            toast.error("Kunne ikke slette medarbejderen. Prøv igen.");
        } finally {
            setDeleteMemberLoading(false);
        }
    }

    function handleCopyLink() {
        const url = `${window.location.origin}/organizations/${id}`;
        void navigator.clipboard.writeText(url).then(() => {
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
            setLinkCopied(true);
            copyTimerRef.current = setTimeout(() => setLinkCopied(false), 2000);
        }).catch(() => toast.error("Kunne ikke kopiere link"));
    }

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <PageContainer className="my-6 px-8 pt-10">
                    <div className="h-8 w-48 rounded-md animate-pulse" style={{ backgroundColor: colors.muted }} />
                </PageContainer>
            </div>
        );
    }

    if (isError || !org) {
        return (
            <div className="min-h-screen">
                <PageContainer className="my-6 px-8 pt-10">
                    <p className="body-md" style={{ color: colors.textMuted }}>Kunne ikke hente organisation. Prøv igen.</p>
                </PageContainer>
            </div>
        );
    }

    const periodEnd = org.current_period_end
        ? new Date(org.current_period_end).toLocaleDateString("da-DK", { year: "numeric", month: "short", day: "numeric" })
        : null;

    return (
        <div className="min-h-screen">
            <PageContainer className="px-8 pb-12">
            {/* Back link — only super admins can navigate the org list */}
            {isSuperAdmin && (
                <Button variant="ghost" size="md" className="mt-4" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                    Organisationer
                </Button>
            )}

            {/* Header */}
            <div className="my-6 pt-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center"
                            style={{ border: `1px solid ${colors.border}` }}
                        >
                            {org.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={org.logo_url} alt={`${org.name} logo`} className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-8 h-8" style={{ color: colors.textMuted }} />
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <h1 className="h1">{org.name}</h1>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Pill color={orgStatusColor[org.status]} size="md" bordered>
                                    {organizationStatusLabels[org.status]}
                                </Pill>
                                <Pill color={orgStatusColor[org.subscription_status]} size="md" bordered>
                                    {subscriptionStatusLabels[org.subscription_status]}
                                </Pill>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="md"
                            icon={linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            iconOnly
                            onClick={handleCopyLink}
                            tooltip={linkCopied ? "Kopieret!" : "Kopier link"}
                        />
                        <Button
                            variant="secondary"
                            size="md"
                            icon={<SquarePen className="w-4 h-4" />}
                            onClick={() => setShowEditModal(true)}
                        >
                            Rediger
                        </Button>
                        {isSuperAdmin && (
                            <DropdownMenu
                                trigger={<Button variant="ghost" size="md" icon={<Ellipsis className="w-4 h-4" />} iconOnly tooltip="Mere" />}
                                items={[
                                    {
                                        label: "Slet",
                                        icon: <Trash2 className="w-4 h-4" />,
                                        onClick: () => setConfirmDeleteOpen(true),
                                        danger: true,
                                    },
                                ]}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4" style={{ borderTop: `1px solid ${colors.border}` }} />

            {/* Content */}
            <div className="mt-6 flex gap-8 items-start">
                {/* Main */}
                <div className="flex-1 min-w-0 space-y-6">
                    <div className="space-y-3">
                        <h2 className="label-lg" style={{ color: colors.textSecondary }}>
                            Medarbejdere {members.length > 0 && <span style={{ color: colors.textMuted }}>({members.length})</span>}
                        </h2>
                        {members.length === 0 ? (
                            <p className="body-sm" style={{ color: colors.textMuted }}>Ingen medarbejdere tilknyttet denne organisation.</p>
                        ) : (
                            <DataTable columns={[
                                { key: "name", header: "Navn", className: "px-6 py-2.5 label-sm" },
                                { key: "position", header: "Stilling", className: "px-6 py-2.5 label-sm" },
                                { key: "role", header: "Rolle", className: "px-6 py-2.5 label-sm" },
                                { key: "status", header: "Status", className: "px-6 py-2.5 label-sm" },
                                { key: "actions", header: "", className: "py-2.5 w-px pr-4" },
                            ]}>
                                {members.map((member) => (
                                    <tr
                                        key={member.user_id}
                                        className="transition-colors"
                                        style={{ backgroundColor: colors.white }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.whiteHover)}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.white)}
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-4">
                                                <SingleAvatar name={member.name} size="sm" />
                                                <span className="label-lg" style={{ color: colors.textPrimary }}>{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <span className="label-md" style={{ color: colors.textPrimary }}>{member.position?.name || "Ikke angivet"}</span>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <span className="label-md" style={{ color: colors.textSecondary }}>{getUserRoleLabel(member.role)}</span>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <Pill
                                                color={member.status === UserStatus.ACTIVE ? "green" : "muted"}
                                                size="md"
                                                bordered
                                            >
                                                {member.status === UserStatus.ACTIVE ? "Aktiv" : "Opsagt"}
                                            </Pill>
                                        </td>
                                        <td className="py-3 pr-4 w-px whitespace-nowrap text-right">
                                            <DropdownMenu
                                                trigger={<Button variant="ghost" size="sm" icon={<Ellipsis className="w-4 h-4" />} iconOnly />}
                                                items={[
                                                    { label: "Rediger", icon: <SquarePen className="w-4 h-4" />, onClick: () => { setSelectedMember(member); setShowEditMemberModal(true); } },
                                                    { label: "Slet", icon: <Trash2 className="w-4 h-4" />, onClick: () => { setSelectedMember(member); setConfirmDeleteMemberOpen(true); }, danger: true, dividerBefore: true },
                                                ]}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </DataTable>
                        )}
                    </div>

                    {/* Billing */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h2 className="label-lg" style={{ color: colors.textSecondary }}>Fakturering</h2>
                            <Pill color="blue" size="sm">Kommer snart</Pill>
                        </div>
                        <div
                            className="rounded-lg border px-6 py-10 text-center"
                            style={{ borderColor: colors.border }}
                        >
                            <p className="body-sm" style={{ color: colors.textMuted }}>Faktureringshistorik er ikke tilgængelig endnu.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-64 flex-shrink-0 py-2">
                    <DetailsSectionHeader label="Org status" onGearClick={() => { }} disabled>
                        <Pill color={orgStatusColor[org.status]} size="md" bordered>
                            {organizationStatusLabels[org.status]}
                        </Pill>
                    </DetailsSectionHeader>

                    <div style={{ borderTop: `1px solid ${colors.border}`, margin: "12px 0" }} />

                    <DetailsSectionHeader label="Abonnement" onGearClick={() => { }} disabled>
                        <Pill color={orgStatusColor[org.subscription_status]} size="md" bordered>
                            {subscriptionStatusLabels[org.subscription_status]}
                        </Pill>
                    </DetailsSectionHeader>

                    {periodEnd && (
                        <>
                            <div style={{ borderTop: `1px solid ${colors.border}`, margin: "12px 0" }} />
                            <DetailsSectionHeader label="Abonnement udløber" onGearClick={() => { }} disabled>
                                <span className="body-sm" style={{ color: colors.textPrimary }}>{periodEnd}</span>
                            </DetailsSectionHeader>
                        </>
                    )}

                    <div style={{ borderTop: `1px solid ${colors.border}`, margin: "12px 0" }} />

                    <DetailsSectionHeader label="Medarbejdere" onGearClick={() => { }} disabled>
                        <TaskAssignedUsers
                            users={members.map((m) => ({ id: m.user_id, name: m.name, position: m.position?.name }))}
                        />
                    </DetailsSectionHeader>

                    <div style={{ borderTop: `1px solid ${colors.border}`, margin: "12px 0" }} />

                    <div>
                        <h3 className="label-md mb-2 py-1.5" style={{ color: colors.textSecondary }}>Projekter</h3>
                        {projects.length === 0 ? (
                            <span className="body-xs" style={{ color: colors.textMuted }}>Ingen projekter</span>
                        ) : (
                            <ul className="space-y-3">
                                {projects.map((project) => (
                                    <li key={project.project_id}>
                                        <Link
                                            href={`/tasks?project=${project.project_id}`}
                                            className="label-sm hover:underline"
                                            style={{ color: colors.textPrimary }}
                                        >
                                            {project.name}
                                        </Link>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: project.color ?? colors.textMuted }}
                                            />
                                            <span className="body-xs" style={{ color: colors.textMuted }}>
                                                Opdateret {formatCommentDate(getProjectLastActivity(project.project_id))}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div style={{ borderTop: `1px solid ${colors.border}`, margin: "12px 0" }} />

                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline gap-2">
                            <span className="caption" style={{ color: colors.textMuted }}>Oprettet</span>
                            <span className="label-sm text-right" style={{ color: colors.textPrimary }}>{formatDateTime(org.created_at)}</span>
                        </div>
                        <div className="flex justify-between items-baseline gap-2">
                            <span className="caption" style={{ color: colors.textMuted }}>Opdateret</span>
                            <span className="label-sm text-right" style={{ color: colors.textPrimary }}>{formatDateTime(org.updated_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
            </PageContainer>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Rediger organisation"
                maxWidth="sm"
                footer={
                    <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                        <Button type="submit" form={editFormId} loading={editLoading} variant="primary" size="md">
                            Opdater
                        </Button>
                        <Button type="button" onClick={() => setShowEditModal(false)} disabled={editLoading} variant="secondary" size="md">
                            Annuller
                        </Button>
                    </div>
                }
            >
                <UpdateOrganizationForm
                    formId={editFormId}
                    organization={org!}
                    onLoadingChange={setEditLoading}
                    onSuccess={handleUpdated}
                />
            </Modal>

            <Modal
                isOpen={showEditMemberModal}
                onClose={() => { setShowEditMemberModal(false); setSelectedMember(null); }}
                title="Rediger medarbejder"
                maxWidth="sm"
                footer={
                    <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                        <Button type="submit" form={editMemberFormId} loading={editMemberLoading} variant="primary" size="md">Opdater</Button>
                        <Button type="button" onClick={() => { setShowEditMemberModal(false); setSelectedMember(null); }} disabled={editMemberLoading} variant="secondary" size="md">Annuller</Button>
                    </div>
                }
            >
                {selectedMember && (
                    <UpdateEmployeeForm
                        formId={editMemberFormId}
                        user={selectedMember}
                        onLoadingChange={setEditMemberLoading}
                        onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ["users"] });
                            setShowEditMemberModal(false);
                            setSelectedMember(null);
                        }}
                    />
                )}
            </Modal>

            <ConfirmModal
                isOpen={confirmDeleteMemberOpen}
                onClose={() => { setConfirmDeleteMemberOpen(false); setSelectedMember(null); }}
                onConfirm={handleConfirmDeleteMember}
                title="Slet medarbejder"
                description={`Er du sikker på, at du vil slette ${selectedMember?.name}? Dette kan ikke fortrydes.`}
                confirmLabel="Slet"
                cancelLabel="Annuller"
                danger
                loading={deleteMemberLoading}
            />

            <ConfirmModal
                isOpen={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Slet organisation"
                description={`Al data tilknyttet denne organisation — inklusiv ${org._count?.users ?? 0} ${(org._count?.users ?? 0) === 1 ? "medarbejder" : "medarbejdere"} og ${org._count?.projects ?? 0} ${(org._count?.projects ?? 0) === 1 ? "projekt" : "projekter"} — vil blive slettet permanent. Dette kan ikke fortrydes.`}
                confirmLabel="Slet"
                cancelLabel="Annuller"
                danger
                loading={deleteLoading}
            />
        </div>
    );
}
