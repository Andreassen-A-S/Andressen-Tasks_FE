import type { Metadata } from "next";
import OrganizationDetailsPage from "@/components/organizations/OrganizationDetailsPage";

export const metadata: Metadata = { title: "Organisation" };

export default function OrganizationDetail({ params }: { params: Promise<{ id: string }> }) {
    return <OrganizationDetailsPage paramsPromise={params} />;
}
