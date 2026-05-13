import type { Metadata } from "next";
import OrganizationPage from "@/components/organizations/OrganizationPage";

export const metadata: Metadata = { title: "Organisationer" };

export default function Organizations() {
    return <OrganizationPage />;
}
