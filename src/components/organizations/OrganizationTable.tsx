"use client";

import type { Organization } from "@/types/organization";
import DataTable from "@/components/common/table/DataTable";
import OrganizationRow from "./OrganizationRow";

interface OrganizationTableProps {
    organizations: Organization[];
}

const columns = [
    { key: "name", header: "Navn", className: "px-6 py-2.5 label-sm min-w-[200px]" },
    { key: "slug", header: "Slug", className: "px-6 py-2.5 label-sm" },
    { key: "orgStatus", header: "Org status", className: "px-6 py-2.5 label-sm whitespace-nowrap" },
    { key: "subscriptionStatus", header: "Abonnement", className: "px-6 py-2.5 label-sm whitespace-nowrap" },
    { key: "created", header: "Oprettet", className: "px-6 py-2.5 label-sm" },
];

export default function OrganizationTable({ organizations }: OrganizationTableProps) {
    if (organizations.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="h3 mb-2">Ingen organisationer fundet</h3>
                <p className="body-md text-text-muted">Opret den første organisation for at komme i gang.</p>
            </div>
        );
    }

    return (
        <DataTable columns={columns}>
            {organizations.map((org) => (
                <OrganizationRow key={org.org_id} organization={org} />
            ))}
        </DataTable>
    );
}
