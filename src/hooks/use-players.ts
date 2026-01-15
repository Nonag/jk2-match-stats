"use client";

import { useState, useEffect, useCallback } from "react";
import type { PlayerWithAliases } from "@/lib/api/players";

export function usePlayers() {
  const [players, setPlayers] = useState<PlayerWithAliases[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/players");
      if (!response.ok) {
        throw new Error("Failed to fetch players");
      }
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return { players, loading, error, refetch: fetchPlayers };
}

export function useCreatePlayer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPlayer = useCallback(async (primaryName: string): Promise<{ id: string } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create player");
      }
      
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPlayer, loading, error };
}

export function useLinkPlayer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const linkPlayer = useCallback(async (matchPlayerId: string, playerId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/players/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchPlayerId, playerId }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to link player");
      }
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const unlinkPlayer = useCallback(async (matchPlayerId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/players/link", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchPlayerId }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to unlink player");
      }
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { linkPlayer, unlinkPlayer, loading, error };
}
