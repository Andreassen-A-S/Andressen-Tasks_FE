"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { getOrganizations } from "@/lib/api/organizations";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/common/buttons/Button";
import TableSkeleton from "@/components/common/loading/TableSkeleton";
import { colors } from "@/constants/colors";
import { formatNumber } from "@/helpers/helpers";
import OrganizationTable from "./OrganizationTable";
import OrganizationCreateModal from "./OrganizationCreateModal";
import { MESTERPLAN_ORG_ID } from "@/constants/org";
import PageContainer from "@/components/layout/PageContainer";

export default function OrganizationPage() {
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const formId = "create-organization-form";

    const { data: allOrganizations = [], isPending, isError } = useQuery({
        queryKey: ["organizations"],
        queryFn: getOrganizations,
    });
    const organizations = allOrganizations.filter(o => o.org_id !== MESTERPLAN_ORG_ID);

    const handleCreated = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        setShowCreateModal(false);
    }, [queryClient]);

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Organisationer"
                subtitle={`${formatNumber(organizations.length)} organisationer`}
                action={
                    <Button
                        variant="primary"
                        size="lg"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Ny organisation
                    </Button>
                }
            />

            <PageContainer className="mt-3 px-8 pb-12 flex flex-col gap-3">
                {isPending ? (
                    <TableSkeleton columns={5} rows={5} />
                ) : isError ? (
                    <div className="rounded-md border px-6 py-12 text-center" style={{ borderColor: colors.border }}>
                        <p className="body-md" style={{ color: colors.textMuted }}>Kunne ikke hente organisationer. Prøv igen senere.</p>
                    </div>
                ) : (
                    <OrganizationTable organizations={organizations} />
                )}
            </PageContainer>

            <OrganizationCreateModal
                isOpen={showCreateModal}
                loading={createLoading}
                formId={formId}
                onClose={() => setShowCreateModal(false)}
                onLoadingChange={setCreateLoading}
                onSuccess={handleCreated}
            />
        </div>
    );
}
