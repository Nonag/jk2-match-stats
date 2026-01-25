"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignMatchPlayer,
  createPlayer,
  deletePlayer,
  getPlayers,
  getPlayersAndMatchPlayers,
  getSuggestions,
  linkPlayer,
  mergePlayers,
  renamePlayer,
  unlinkPlayer,
} from "@/lib/api/players";
import { matchKeys } from "./matches";

export const playerKeys = {
  all: ["players"] as const,
  combined: ["players", "combined"] as const,
  suggestions: ["players", "suggestions"] as const,
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

export function usePlayersAndMatchPlayers() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: playerKeys.combined,
    queryFn: getPlayersAndMatchPlayers,
  });

  return {
    items: data ?? [],
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}

export function useSuggestions() {
  const { data, isLoading, error } = useQuery({
    queryKey: playerKeys.suggestions,
    queryFn: getSuggestions,
  });

  return {
    suggestions: data ?? [],
    loading: isLoading,
    error: error as Error | null,
  };
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.combined });
    },
  });

  return {
    createPlayer: async (aliasPrimary: string) => {
      try {
        const result = await mutation.mutateAsync(aliasPrimary);
        return result;
      } catch {
        return null;
      }
    },
    loading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}

export function useRenamePlayer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, aliasPrimary }: { id: string; aliasPrimary: string }) =>
      renamePlayer(id, aliasPrimary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.combined });
    },
  });

  return {
    renamePlayer: async (id: string, aliasPrimary: string) => {
      try {
        await mutation.mutateAsync({ id, aliasPrimary });
        return true;
      } catch {
        return false;
      }
    },
    loading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.combined });
    },
  });

  return {
    deletePlayer: async (id: string) => {
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

export function useLinkPlayer() {
  const queryClient = useQueryClient();

  const linkMutation = useMutation({
    mutationFn: ({ matchPlayerId, playerId }: { matchPlayerId: string; playerId: string }) =>
      linkPlayer(matchPlayerId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.combined });
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: unlinkPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.combined });
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

export function useAssignMatchPlayer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ matchPlayerId, playerId }: { matchPlayerId: string; playerId: string }) =>
      assignMatchPlayer(matchPlayerId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.combined });
    },
  });

  return {
    assignMatchPlayer: async (matchPlayerId: string, playerId: string) => {
      try {
        await mutation.mutateAsync({ matchPlayerId, playerId });
        return true;
      } catch {
        return false;
      }
    },
    loading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}

export function useMergePlayers() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      targetPlayerId,
      sourcePlayerIds,
    }: {
      targetPlayerId: string;
      sourcePlayerIds: string[];
    }) => mergePlayers(targetPlayerId, sourcePlayerIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.all });
      queryClient.invalidateQueries({ queryKey: playerKeys.combined });
    },
  });

  return {
    mergePlayers: async (targetPlayerId: string, sourcePlayerIds: string[]) => {
      try {
        await mutation.mutateAsync({ targetPlayerId, sourcePlayerIds });
        return true;
      } catch {
        return false;
      }
    },
    loading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
