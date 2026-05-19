import { type Organization } from "@/types/organization";
import { colors } from "@/constants/colors";
import Pill from "@/components/common/label/Pill";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { organizationStatusLabels, subscriptionStatusLabels, orgStatusColor } from "./organizationDisplay";

interface OrganizationRowProps {
    organization: Organization;
}

export default function OrganizationRow({ organization }: OrganizationRowProps) {
    const createdAt = new Date(organization.created_at).toLocaleDateString("da-DK", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <tr
            className="transition-colors"
            style={{ backgroundColor: colors.white }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.whiteHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.white)}
        >
            <td className="px-6 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                        {organization.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={organization.logo_url} alt={`${organization.name} logo`} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-4 h-4" style={{ color: colors.textMuted }} />
                        )}
                    </div>
                    <Link
                        href={`/organizations/${organization.org_id}`}
                        className="label-lg hover:underline"
                        style={{ color: colors.textPrimary }}
                    >
                        {organization.name}
                    </Link>
                </div>
            </td>
            <td className="px-6 py-3 whitespace-nowrap">
                <span className="mono-xs" style={{ color: colors.textMuted }}>{organization.slug}</span>
            </td>
            <td className="px-6 py-3 whitespace-nowrap">
                <Pill color={orgStatusColor[organization.status]} bordered>
                    {organizationStatusLabels[organization.status]}
                </Pill>
            </td>
            <td className="px-6 py-3 whitespace-nowrap">
                <Pill color={orgStatusColor[organization.subscription_status]} bordered>
                    {subscriptionStatusLabels[organization.subscription_status]}
                </Pill>
            </td>
            <td className="px-6 py-3 whitespace-nowrap">
                <span className="label-md" style={{ color: colors.textSecondary }}>{createdAt}</span>
            </td>
        </tr>
    );
}
