import { getAuthHeaders } from "@/helpers/helpers";
import {
  DashboardStats,
  TopPerformer,
  TrendDataPoint,
  UserStats,
} from "@/types/stats";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get all dashboard statistics in a single optimized call
 * This is the recommended method for loading the dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_URL}/stats/dashboard`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: "Failed to fetch dashboard stats" }));
    throw new Error(error.error || "Failed to fetch dashboard stats");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Get top performers with optional limit
 */
export async function getTopPerformers(
  limit: number = 5,
): Promise<TopPerformer[]> {
  const res = await fetch(`${API_URL}/stats/top-performers?limit=${limit}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: "Failed to fetch top performers" }));
    throw new Error(error.error || "Failed to fetch top performers");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Get task trends over specified number of days
 */
export async function getTaskTrends(
  days: number = 7,
): Promise<TrendDataPoint[]> {
  const res = await fetch(`${API_URL}/stats/trends?days=${days}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: "Failed to fetch task trends" }));
    throw new Error(error.error || "Failed to fetch task trends");
  }

  const response = await res.json();
  return response.data;
}

/**
 * Get current user's statistics
 */
export async function getMyStats(): Promise<UserStats> {
  const res = await fetch(`${API_URL}/stats/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: "Failed to fetch your stats" }));
    throw new Error(error.error || "Failed to fetch your stats");
  }

  const response = await res.json();
  return response.data;
}
