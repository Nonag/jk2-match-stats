import prisma from "./client";

export interface PlayerWithAliases {
  id: string;
  primaryName: string;
  aliases: {
    id: string;
    nameClean: string;
    nameRaw: string;
  }[];
  matchCount: number;
}

export async function getAllPlayers(): Promise<PlayerWithAliases[]> {
  const players = await prisma.player.findMany({
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
    orderBy: { primaryName: "asc" },
  });

  return players.map((player) => ({
    id: player.id,
    primaryName: player.primaryName,
    aliases: player.aliases,
    matchCount: player._count.matchPlayers,
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
    id: player.id,
    primaryName: player.primaryName,
    aliases: player.aliases,
    matchCount: player._count.matchPlayers,
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
  { id: string; nameClean: string; nameRaw: string; matchId: string; team: string }[]
> {
  const unlinked = await prisma.matchPlayer.findMany({
    where: {
      playerId: null,
      team: { not: "Spectator" },
    },
    select: {
      id: true,
      nameClean: true,
      nameRaw: true,
      matchId: true,
      team: true,
    },
    distinct: ["nameClean"],
  });

  return unlinked;
}
