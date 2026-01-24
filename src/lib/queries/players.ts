"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPlayers,
  createPlayer,
  linkPlayer,
  unlinkPlayer,
} from "@/lib/api/players";
import { matchKeys } from "./matches";

export const playerKeys = {
  all: ["players"] as const,
};

export function usePlayers() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: playerKeys.all,
    queryFn: getPlayers,
  });

  return {
    players: data ?? [],
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.all });
    },
  });

  return {
    createPlayer: async (primaryName: string) => {
      try {
        const result = await mutation.mutateAsync(primaryName);
        return result;
      } catch {
        return null;
      }
    },
    loading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}

export function useLinkPlayer() {
  const queryClient = useQueryClient();

  const linkMutation = useMutation({
    mutationFn: ({ matchPlayerId, playerId }: { matchPlayerId: string; playerId: string }) =>
      linkPlayer(matchPlayerId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.all });
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: unlinkPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.all });
    },
  });

  return {
    linkPlayer: async (matchPlayerId: string, playerId: string) => {
      try {
        await linkMutation.mutateAsync({ matchPlayerId, playerId });
        return true;
      } catch {
        return false;
      }
    },
    unlinkPlayer: async (matchPlayerId: string) => {
      try {
        await unlinkMutation.mutateAsync(matchPlayerId);
        return true;
      } catch {
        return false;
      }
    },
    loading: linkMutation.isPending || unlinkMutation.isPending,
    error: (linkMutation.error || unlinkMutation.error) as Error | null,
  };
}
