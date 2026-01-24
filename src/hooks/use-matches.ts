"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMatches,
  getMatch,
  createMatch,
  deleteMatch,
} from "@/lib/api/matches";

// Query keys for cache management
export const matchKeys = {
  all: ["matches"] as const,
  detail: (id: string) => ["matches", id] as const,
};

export function useMatches() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: matchKeys.all,
    queryFn: getMatches,
  });

  return {
    matches: data ?? [],
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}

export function useMatch(id: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: () => getMatch(id),
    enabled: !!id,
  });

  return {
    match: data ?? null,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}

export function useImportMatch() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    importMatch: async (file: File) => {
      try {
        const result = await mutation.mutateAsync(file);
        return { success: true, matchId: result.matchId };
      } catch {
        return { success: false };
      }
    },
    loading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    deleteMatch: async (id: string) => {
      try {
        await mutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    loading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
