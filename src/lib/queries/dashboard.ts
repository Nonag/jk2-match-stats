"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api/dashboard";
import type { DashboardStats } from "@/lib/api/dashboard";

export type { DashboardStats };

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: (days: number) => ["dashboard", "stats", days] as const,
};

export function useDashboardStats(days: number = 7) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: dashboardKeys.stats(days),
    queryFn: () => getDashboardStats(days),
  });

  return {
    stats: data ?? null,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}
