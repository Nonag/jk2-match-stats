import prisma from "./client";
import type { MatchPlayerDetail, MatchStats } from "./match";

export interface PlayerAlias {
  id: string;
  nameClean: string;
  nameRaw: string;
}

export interface PlayerDetail {
  aliasPrimary: string;
  aliases: PlayerAlias[];
  id: string;
  matchCount: number;
  matchDateLatest: Date | null;
  matchStats: MatchStats;
}

export async function getAllPlayers(): Promise<PlayerDetail[]> {
  const players = await prisma.player.findMany({
    include: {
      aliases: {
        select: {
          id: true,
          nameClean: true,
          nameRaw: true,
        },
      },
    },
    orderBy: { aliasPrimary: "asc" },
  });

  return players.map((player) => ({
    aliasPrimary: player.aliasPrimary,
    aliases: player.aliases,
    id: player.id,
    matchCount: player.matchCount,
    matchDateLatest: player.matchDateLatest,
    matchStats: player.matchStats as unknown as MatchStats,
  }));
}

export async function getPlayerById(id: string): Promise<PlayerDetail | null> {
  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      aliases: {
        select: {
          id: true,
          nameClean: true,
          nameRaw: true,
        },
      },
    },
  });

  if (!player) return null;

  return {
    aliasPrimary: player.aliasPrimary,
    aliases: player.aliases,
    id: player.id,
    matchCount: player.matchCount,
    matchDateLatest: player.matchDateLatest,
    matchStats: player.matchStats as unknown as MatchStats,
  };
}

export async function createPlayer(aliasPrimary: string): Promise<{ id: string }> {
  const player = await prisma.player.create({
    data: { aliasPrimary },
    select: { id: true },
  });
  return player;
}

export async function updatePlayerAlias(
  id: string,
  aliasPrimary: string
): Promise<void> {
  await prisma.player.update({
    where: { id },
    data: { aliasPrimary },
  });
}

export async function linkAliasToPlayer(
  playerId: string,
  nameClean: string,
  nameRaw: string
): Promise<void> {
  await prisma.playerAlias.upsert({
    where: {
      nameClean_playerId: {
        nameClean,
        playerId,
      },
    },
    create: {
      playerId,
      nameClean,
      nameRaw,
    },
    update: {},
  });
}

export async function linkMatchPlayerToPlayer(
  matchPlayerId: string,
  playerId: string
): Promise<void> {
  const matchPlayer = await prisma.matchPlayer.findUnique({
    where: { id: matchPlayerId },
    select: { nameClean: true, nameRaw: true },
  });

  if (!matchPlayer) {
    throw new Error("Match player not found");
  }

  // Update the match player to link to the player
  await prisma.matchPlayer.update({
    where: { id: matchPlayerId },
    data: { playerId },
  });

  // Add the alias to the player
  await linkAliasToPlayer(playerId, matchPlayer.nameClean, matchPlayer.nameRaw);
}

export async function unlinkMatchPlayerFromPlayer(matchPlayerId: string): Promise<void> {
  await prisma.matchPlayer.update({
    where: { id: matchPlayerId },
    data: { playerId: null },
  });
}

export async function getUnlinkedMatchPlayers(): Promise<
  { id: string; matchId: string; nameClean: string; nameRaw: string; team: string }[]
> {
  const unlinked = await prisma.matchPlayer.findMany({
    where: {
      playerId: null,
      team: { in: ["Red", "Blue"] },
    },
    select: {
      id: true,
      matchId: true,
      nameClean: true,
      nameRaw: true,
      team: true,
    },
    distinct: ["nameClean"],
  });

  return unlinked;
}

// Combined view of players and unassigned matchplayers for the player management table
// Extends MatchPlayerDetail with extra metadata fields
export interface PlayerListItem extends MatchPlayerDetail {
  aliasPrimary: string;
  aliases: { id: string; nameClean: string; nameRaw: string }[];
  matchCount: number;
  matchDate: Date | null; // For matchPlayers: the match date; for players: null (use matchDateLatest)
  matchDateLatest: Date | null;
  matchId: string | null;
  type: "matchplayer" | "player";
}

// Re-export MatchStats for convenience
export type { MatchStats } from "./match";

export async function getPlayersAndUnassignedMatchPlayers(): Promise<PlayerListItem[]> {
  // Get all players with stored stats (no need to load all matchPlayers)
  const players = await prisma.player.findMany({
    include: {
      aliases: {
        select: { id: true, nameClean: true, nameRaw: true },
      },
    },
  });

  const playerItems: PlayerListItem[] = players.map((player) => {
    const stats = player.matchStats as unknown as MatchStats;

    return {
      ...stats,
      aliasPrimary: player.aliasPrimary,
      aliases: player.aliases,
      clientNumber: 0,
      id: player.id,
      lastNonSpecTeam: "",
      matchCount: player.matchCount,
      matchDate: null, // Players don't have a single match date
      matchDateLatest: player.matchDateLatest,
      matchId: null,
      nameClean: player.aliasPrimary,
      nameRaw: player.aliasPrimary,
      playerAlias: player.aliasPrimary,
      playerId: player.id,
      team: "",
      type: "player" as const,
    } as PlayerListItem;
  });

  // Get individual unassigned matchplayers (Red/Blue only)
  const unassignedMatchPlayers = await prisma.matchPlayer.findMany({
    where: { playerId: null, team: { in: ["Red", "Blue"] } },
    include: { match: { select: { date: true } } },
    orderBy: { match: { date: "desc" } },
  });

  const unassignedItems: PlayerListItem[] = unassignedMatchPlayers.map((mp) => ({
    ...mp,
    aliasPrimary: mp.nameClean,
    aliases: [],
    matchCount: 1,
    matchDate: mp.match.date, // The specific match date for this matchPlayer
    matchDateLatest: mp.match.date,
    matchId: mp.matchId,
    playerAlias: null,
    type: "matchplayer" as const,
  }));

  // Combine and sort by most recent match
  const allItems = [...playerItems, ...unassignedItems];
  allItems.sort((a, b) => {
    if (!a.matchDateLatest && !b.matchDateLatest) return 0;
    if (!a.matchDateLatest) return 1;
    if (!b.matchDateLatest) return -1;
    return b.matchDateLatest.getTime() - a.matchDateLatest.getTime();
  });

  return allItems;
}

// Get all matchplayers for similarity-based suggestions in the dialog
export async function getAllMatchPlayersForSuggestions(): Promise<
  { nameClean: string; nameRaw: string; playerId: string | null; playerAlias: string | null }[]
> {
  const matchPlayers = await prisma.matchPlayer.findMany({
    where: { team: { in: ["Red", "Blue"] } },
    select: {
      nameClean: true,
      nameRaw: true,
      playerId: true,
      player: { select: { aliasPrimary: true } },
    },
    distinct: ["nameClean"],
  });

  return matchPlayers.map((mp) => ({
    nameClean: mp.nameClean,
    nameRaw: mp.nameRaw,
    playerId: mp.playerId,
    playerAlias: mp.player?.aliasPrimary ?? null,
  }));
}

// Merge multiple players into one
export async function mergePlayers(
  targetPlayerId: string,
  sourcePlayerIds: string[]
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Move all matchPlayers from source players to target
    await tx.matchPlayer.updateMany({
      where: { playerId: { in: sourcePlayerIds } },
      data: { playerId: targetPlayerId },
    });

    // Move all aliases from source players to target
    for (const sourceId of sourcePlayerIds) {
      const sourceAliases = await tx.playerAlias.findMany({
        where: { playerId: sourceId },
      });

      for (const alias of sourceAliases) {
        // Try to create alias for target, skip if already exists
        await tx.playerAlias.upsert({
          where: {
            nameClean_playerId: {
              nameClean: alias.nameClean,
              playerId: targetPlayerId,
            },
          },
          create: {
            playerId: targetPlayerId,
            nameClean: alias.nameClean,
            nameRaw: alias.nameRaw,
          },
          update: {},
        });
      }
    }

    // Delete source players (aliases will cascade delete)
    await tx.player.deleteMany({
      where: { id: { in: sourcePlayerIds } },
    });
  });
}

// Assign a single matchPlayer to a player by matchPlayer ID
export async function assignMatchPlayerById(
  matchPlayerId: string,
  playerId: string
): Promise<void> {
  // Get the matchPlayer to get nameClean and nameRaw for alias
  const matchPlayer = await prisma.matchPlayer.findUnique({
    where: { id: matchPlayerId },
    select: { nameClean: true, nameRaw: true },
  });

  if (!matchPlayer) return;

  // Update this single matchPlayer
  await prisma.matchPlayer.update({
    where: { id: matchPlayerId },
    data: { playerId },
  });

  // Add alias to player
  await linkAliasToPlayer(playerId, matchPlayer.nameClean, matchPlayer.nameRaw);
}

// Delete a player
export async function deletePlayer(playerId: string): Promise<void> {
  // First unlink all matchPlayers
  await prisma.matchPlayer.updateMany({
    where: { playerId },
    data: { playerId: null },
  });

  // Then delete the player (aliases will cascade)
  await prisma.player.delete({
    where: { id: playerId },
  });
}
