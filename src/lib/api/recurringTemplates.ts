import { getAuthHeaders } from "@/helpers/helpers";
import {
  CreateRecurringTemplateInput,
  UpdateRecurringTemplateInput,
  RecurringTemplate,
} from "@/types/recuringTemplate";
import { Task } from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Recurring template API functions

/**
 * Get all recurring templates
 */
export async function getRecurringTemplates(): Promise<RecurringTemplate[]> {
  const res = await fetch(`${API_URL}/recurring-templates`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch recurring templates");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Get a single recurring template by ID
 */
export async function getRecurringTemplate(
  templateId: string,
): Promise<RecurringTemplate> {
  const res = await fetch(`${API_URL}/recurring-templates/${templateId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch recurring template");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Create a new recurring template
 */
export async function createRecurringTemplate(
  data: CreateRecurringTemplateInput,
): Promise<RecurringTemplate> {
  const res = await fetch(`${API_URL}/recurring-templates`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create recurring template");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Update a recurring template
 */
export async function updateRecurringTemplate(
  templateId: string,
  updates: UpdateRecurringTemplateInput,
): Promise<RecurringTemplate> {
  const res = await fetch(`${API_URL}/recurring-templates/${templateId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update recurring template");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Delete a recurring template (and all its instances)
 */
export async function deleteRecurringTemplate(
  templateId: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/recurring-templates/${templateId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete recurring template");
  }
}

/**
 * Deactivate a template (stops generating new instances)
 */
export async function deactivateTemplate(
  templateId: string,
): Promise<RecurringTemplate> {
  const res = await fetch(
    `${API_URL}/recurring-templates/${templateId}/deactivate`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to deactivate template");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Reactivate a template (resumes generating instances)
 */
export async function reactivateTemplate(
  templateId: string,
): Promise<RecurringTemplate> {
  const res = await fetch(
    `${API_URL}/recurring-templates/${templateId}/reactivate`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to reactivate template");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Get all task instances for a template
 */
export async function getTemplateInstances(
  templateId: string,
): Promise<Task[]> {
  const res = await fetch(
    `${API_URL}/recurring-templates/${templateId}/instances`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch template instances");
  }

  const response = await res.json();
  return response.data;
}
