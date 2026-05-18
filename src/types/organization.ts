export enum OrganizationStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  INACTIVE = "INACTIVE",
}

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED",
}

export interface Organization {
  org_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  status: OrganizationStatus;
  subscription_status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  _count?: { users: number };
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  logo_url?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  logo_url?: string | null;
}
