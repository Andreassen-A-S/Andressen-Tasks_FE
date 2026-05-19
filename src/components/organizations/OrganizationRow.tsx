import { OrganizationStatus, SubscriptionStatus, type Organization } from "@/types/organization";
import { colors } from "@/constants/colors";
import Pill, { type PillColor } from "@/components/common/label/Pill";
import { Building2 } from "lucide-react";
import Link from "next/link";

interface OrganizationRowProps {
    organization: Organization;
}

const organizationStatusLabels: Record<OrganizationStatus, string> = {
    [OrganizationStatus.ACTIVE]: "Aktiv",
    [OrganizationStatus.SUSPENDED]: "Suspenderet",
    [OrganizationStatus.INACTIVE]: "Inaktiv",
};

const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.TRIALING]: "Prøve",
    [SubscriptionStatus.ACTIVE]: "Aktiv",
    [SubscriptionStatus.PAST_DUE]: "Forfalden",
    [SubscriptionStatus.CANCELED]: "Opsagt",
    [SubscriptionStatus.EXPIRED]: "Udløbet",
};

const statusColor: Record<OrganizationStatus | SubscriptionStatus, PillColor> = {
    [OrganizationStatus.ACTIVE]: "green",
    [SubscriptionStatus.TRIALING]: "blue",
    [SubscriptionStatus.PAST_DUE]: "yellow",
    [OrganizationStatus.SUSPENDED]: "red",
    [SubscriptionStatus.CANCELED]: "red",
    [SubscriptionStatus.EXPIRED]: "red",
    [OrganizationStatus.INACTIVE]: "muted",
};

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
                <Pill color={statusColor[organization.status]} bordered>
                    {organizationStatusLabels[organization.status]}
                </Pill>
            </td>
            <td className="px-6 py-3 whitespace-nowrap">
                <Pill color={statusColor[organization.subscription_status]} bordered>
                    {subscriptionStatusLabels[organization.subscription_status]}
                </Pill>
            </td>
            <td className="px-6 py-3 whitespace-nowrap">
                <span className="label-md" style={{ color: colors.textSecondary }}>{createdAt}</span>
            </td>
        </tr>
    );
}
