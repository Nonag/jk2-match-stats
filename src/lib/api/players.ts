import type { PlayerListItem, PlayerWithAliases } from "@/lib/db/player";

export async function getPlayers(): Promise<PlayerWithAliases[]> {
  const response = await fetch("/api/players");
  if (!response.ok) throw new Error("Failed to fetch players");
  return response.json();
}

export async function getPlayersAndMatchPlayers(): Promise<PlayerListItem[]> {
  const response = await fetch("/api/players?view=combined");
  if (!response.ok) throw new Error("Failed to fetch players");
  const data = await response.json();
  // Convert date strings back to Date objects
  return data.map((item: PlayerListItem & { lastMatchDate: string | null }) => ({
    ...item,
    lastMatchDate: item.lastMatchDate ? new Date(item.lastMatchDate) : null,
  }));
}

export async function getSuggestions(): Promise<
  { nameClean: string; nameRaw: string; playerId: string | null; playerName: string | null }[]
> {
  const response = await fetch("/api/players?view=suggestions");
  if (!response.ok) throw new Error("Failed to fetch suggestions");
  return response.json();
}

export async function createPlayer(primaryName: string): Promise<{ id: string }> {
  const response = await fetch("/api/players", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ primaryName }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to create player");
  return data;
}

export async function renamePlayer(id: string, primaryName: string): Promise<void> {
  const response = await fetch("/api/players", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, primaryName }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to rename player");
  }
}

export async function deletePlayer(id: string): Promise<void> {
  const response = await fetch("/api/players", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete player");
  }
}

export async function linkPlayer(matchPlayerId: string, playerId: string): Promise<void> {
  const response = await fetch("/api/players/link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchPlayerId, playerId }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to link player");
  }
}

export async function unlinkPlayer(matchPlayerId: string): Promise<void> {
  const response = await fetch("/api/players/link", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchPlayerId }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to unlink player");
  }
}

export async function assignMatchPlayers(nameClean: string, playerId: string): Promise<void> {
  const response = await fetch("/api/players/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nameClean, playerId }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to assign match players");
  }
}

export async function mergePlayers(targetPlayerId: string, sourcePlayerIds: string[]): Promise<void> {
  const response = await fetch("/api/players/merge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetPlayerId, sourcePlayerIds }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to merge players");
  }
}
