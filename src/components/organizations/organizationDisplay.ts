import { OrganizationStatus, SubscriptionStatus } from "@/types/organization";
import type { PillColor } from "@/components/common/label/Pill";

export const organizationStatusLabels: Record<OrganizationStatus, string> = {
    [OrganizationStatus.ACTIVE]: "Aktiv",
    [OrganizationStatus.SUSPENDED]: "Suspenderet",
    [OrganizationStatus.INACTIVE]: "Inaktiv",
};

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.TRIALING]: "Prøve",
    [SubscriptionStatus.ACTIVE]: "Aktiv",
    [SubscriptionStatus.PAST_DUE]: "Forfalden",
    [SubscriptionStatus.CANCELED]: "Opsagt",
    [SubscriptionStatus.EXPIRED]: "Udløbet",
};

export const orgStatusColor: Record<OrganizationStatus | SubscriptionStatus, PillColor> = {
    [OrganizationStatus.ACTIVE]: "green",
    [SubscriptionStatus.TRIALING]: "blue",
    [SubscriptionStatus.PAST_DUE]: "yellow",
    [OrganizationStatus.SUSPENDED]: "red",
    [SubscriptionStatus.CANCELED]: "red",
    [SubscriptionStatus.EXPIRED]: "red",
    [OrganizationStatus.INACTIVE]: "muted",
};
