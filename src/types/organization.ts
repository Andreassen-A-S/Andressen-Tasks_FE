export interface Organization {
  org_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
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
