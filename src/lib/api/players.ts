import type { PlayerWithAliases } from "@/lib/db/player";

export async function getPlayers(): Promise<PlayerWithAliases[]> {
  const response = await fetch("/api/players");
  if (!response.ok) throw new Error("Failed to fetch players");
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
