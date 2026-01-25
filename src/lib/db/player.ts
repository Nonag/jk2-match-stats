import prisma from "./client";
import type { MatchPlayerDetail } from "./match";

export interface PlayerAlias {
  id: string;
  nameClean: string;
  nameRaw: string;
}

export interface PlayerWithAliases {
  aliases: PlayerAlias[];
  id: string;
  matchCount: number;
  primaryName: string;
}

export async function getAllPlayers(): Promise<PlayerWithAliases[]> {
  const players = await prisma.player.findMany({
    include: {
      _count: {
        select: {
          matchPlayers: true,
        },
      },
      aliases: {
        select: {
          id: true,
          nameClean: true,
          nameRaw: true,
        },
      },
    },
    orderBy: { primaryName: "asc" },
  });

  return players.map((player) => ({
    aliases: player.aliases,
    id: player.id,
    matchCount: player._count.matchPlayers,
    primaryName: player.primaryName,
  }));
}

export async function getPlayerById(id: string): Promise<PlayerWithAliases | null> {
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
      _count: {
        select: {
          matchPlayers: true,
        },
      },
    },
  });

  if (!player) return null;

  return {
    aliases: player.aliases,
    id: player.id,
    matchCount: player._count.matchPlayers,
    primaryName: player.primaryName,
  };
}

export async function createPlayer(primaryName: string): Promise<{ id: string }> {
  const player = await prisma.player.create({
    data: { primaryName },
    select: { id: true },
  });
  return player;
}

export async function updatePlayerPrimaryName(
  id: string,
  primaryName: string
): Promise<void> {
  await prisma.player.update({
    where: { id },
    data: { primaryName },
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
  aliases: { id: string; nameClean: string; nameRaw: string }[];
  lastMatchDate: Date | null;
  matchCount: number;
  matchId: string | null;
  primaryName: string;
  type: "matchplayer" | "player";
}

// Helper to accumulate numeric stats from matchplayers
function accumulateStats<T extends Record<string, unknown>>(matchPlayers: T[]): Record<string, number> {
  if (matchPlayers.length === 0) return {};
  const result: Record<string, number> = {};
  for (const key of Object.keys(matchPlayers[0])) {
    if (typeof matchPlayers[0][key] === "number") {
      result[key] = matchPlayers.reduce((sum, mp) => sum + (Number(mp[key]) || 0), 0);
    }
  }
  return result;
}

export async function getPlayersAndUnassignedMatchPlayers(): Promise<PlayerListItem[]> {
  // Get all players with their matchplayers (full stats)
  const players = await prisma.player.findMany({
    include: {
      aliases: {
        select: { id: true, nameClean: true, nameRaw: true },
      },
      matchPlayers: {
        where: { team: { in: ["Red", "Blue"] } },
        include: { match: { select: { date: true } } },
      },
    },
  });

  const playerItems: PlayerListItem[] = players.map((player) => {
    const stats = accumulateStats(player.matchPlayers);
    const lastMatchDate = player.matchPlayers.length > 0
      ? player.matchPlayers.reduce((latest, mp) =>
          mp.match.date > latest ? mp.match.date : latest,
          player.matchPlayers[0].match.date
        )
      : null;

    return {
      ...stats,
      aliases: player.aliases,
      id: player.id,
      lastMatchDate,
      lastNonSpecTeam: "",
      matchCount: player.matchPlayers.length,
      matchId: null,
      nameClean: player.primaryName,
      nameRaw: player.primaryName,
      playerId: player.id,
      playerPrimaryName: player.primaryName,
      primaryName: player.primaryName,
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
    aliases: [],
    lastMatchDate: mp.match.date,
    matchCount: 1,
    matchId: mp.matchId,
    playerPrimaryName: null,
    primaryName: mp.nameClean,
    type: "matchplayer" as const,
  }));

  // Combine and sort by most recent match
  const allItems = [...playerItems, ...unassignedItems];
  allItems.sort((a, b) => {
    if (!a.lastMatchDate && !b.lastMatchDate) return 0;
    if (!a.lastMatchDate) return 1;
    if (!b.lastMatchDate) return -1;
    return b.lastMatchDate.getTime() - a.lastMatchDate.getTime();
  });

  return allItems;
}

// Get all matchplayers for similarity-based suggestions in the dialog
export async function getAllMatchPlayersForSuggestions(): Promise<
  { nameClean: string; nameRaw: string; playerId: string | null; playerName: string | null }[]
> {
  const matchPlayers = await prisma.matchPlayer.findMany({
    where: { team: { in: ["Red", "Blue"] } },
    select: {
      nameClean: true,
      nameRaw: true,
      playerId: true,
      player: { select: { primaryName: true } },
    },
    distinct: ["nameClean"],
  });

  return matchPlayers.map((mp) => ({
    nameClean: mp.nameClean,
    nameRaw: mp.nameRaw,
    playerId: mp.playerId,
    playerName: mp.player?.primaryName ?? null,
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

// Assign multiple matchplayers to a player by nameClean
export async function assignMatchPlayersByNameClean(
  nameClean: string,
  playerId: string
): Promise<void> {
  // Get one matchPlayer to get the nameRaw
  const sample = await prisma.matchPlayer.findFirst({
    where: { nameClean, team: { not: "Spectator" } },
    select: { nameRaw: true },
  });

  if (!sample) return;

  // Update all matchPlayers with this nameClean
  await prisma.matchPlayer.updateMany({
    where: { nameClean, team: { not: "Spectator" } },
    data: { playerId },
  });

  // Add alias to player
  await linkAliasToPlayer(playerId, nameClean, sample.nameRaw);
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
