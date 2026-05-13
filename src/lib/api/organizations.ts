import { getAuthHeaders } from "@/helpers/helpers";
import type { Organization, CreateOrganizationInput, UpdateOrganizationInput } from "@/types/organization";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getOrganizations(): Promise<Organization[]> {
  const res = await fetch(`${API_URL}/organizations`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch organizations");
  const data = await res.json();
  return data.data;
}

export async function getOrganization(id: string): Promise<Organization> {
  const res = await fetch(`${API_URL}/organizations/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch organization");
  const data = await res.json();
  return data.data;
}

export async function createOrganization(input: CreateOrganizationInput): Promise<Organization> {
  const res = await fetch(`${API_URL}/organizations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create organization");
  }
  const data = await res.json();
  return data.data;
}

export async function updateOrganization(id: string, input: UpdateOrganizationInput): Promise<Organization> {
  const res = await fetch(`${API_URL}/organizations/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update organization");
  }
  const data = await res.json();
  return data.data;
}

export async function prepareOrgLogo(orgId: string, mimeType: string): Promise<{ uploadUrl: string; gcsPath: string }> {
  const res = await fetch(`${API_URL}/organizations/${orgId}/logo/prepare`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ mime_type: mimeType }),
  });
  if (!res.ok) throw new Error("Failed to prepare logo upload");
  const data = await res.json();
  return data.data;
}

export async function deleteOrganization(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/organizations/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete organization");
}
