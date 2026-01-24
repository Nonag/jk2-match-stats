import type { DashboardStats, StatWithTrend } from "@/lib/db/match";

export type { DashboardStats, StatWithTrend };

export async function getDashboardStats(days: number): Promise<DashboardStats> {
  const response = await fetch(`/api/dashboard/stats?days=${days}`);
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}
