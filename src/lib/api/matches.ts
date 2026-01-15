import prisma from "@/lib/prisma";
import { ParsedMatchData, calculateMatchStats } from "@/lib/csv-parser";

export interface MatchSummary {
  id: string;
  date: Date;
  mapName: string;
  serverName: string;
  redScore: number;
  blueScore: number;
  duration: number;
}

export interface MatchDetail {
  id: string;
  date: Date;
  mapName: string;
  serverIp: string;
  serverName: string;
  redScore: number;
  blueScore: number;
  duration: number;
  fileName: string;
  players: MatchPlayerDetail[];
}

export interface MatchPlayerDetail {
  id: string;
  clientNumber: number;
  team: string;
  nameClean: string;
  nameRaw: string;
  score: number;
  captures: number;
  returns: number;
  baseCaptures: number;
  assists: number;
  flagHold: number;
  flagGrabs: number;
  kills: number;
  deaths: number;
  ping: number;
  time: number;
  playerId: string | null;
  playerPrimaryName: string | null;
}

export async function getAllMatches(): Promise<MatchSummary[]> {
  const matches = await prisma.match.findMany({
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      mapName: true,
      serverName: true,
      redScore: true,
      blueScore: true,
      duration: true,
    },
  });
  
  return matches;
}

export async function getMatchById(id: string): Promise<MatchDetail | null> {
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      matchPlayers: {
        include: {
          player: {
            select: {
              primaryName: true,
            },
          },
        },
        orderBy: [
          { team: "asc" },
          { score: "desc" },
        ],
      },
    },
  });
  
  if (!match) return null;
  
  return {
    id: match.id,
    date: match.date,
    mapName: match.mapName,
    serverIp: match.serverIp,
    serverName: match.serverName,
    redScore: match.redScore,
    blueScore: match.blueScore,
    duration: match.duration,
    fileName: match.fileName,
    players: match.matchPlayers.map((mp) => ({
      id: mp.id,
      clientNumber: mp.clientNumber,
      team: mp.team,
      nameClean: mp.nameClean,
      nameRaw: mp.nameRaw,
      score: mp.score,
      captures: mp.captures,
      returns: mp.returns,
      baseCaptures: mp.baseCaptures,
      assists: mp.assists,
      flagHold: mp.flagHold,
      flagGrabs: mp.flagGrabs,
      kills: mp.kills,
      deaths: mp.deaths,
      ping: mp.ping,
      time: mp.time,
      playerId: mp.playerId,
      playerPrimaryName: mp.player?.primaryName ?? null,
    })),
  };
}

export async function checkMatchExists(fileName: string): Promise<boolean> {
  const match = await prisma.match.findUnique({
    where: { fileName },
    select: { id: true },
  });
  return match !== null;
}

export async function importMatch(data: ParsedMatchData): Promise<{ id: string }> {
  const { redScore, blueScore, duration } = calculateMatchStats(data.players);
  
  const match = await prisma.match.create({
    data: {
      date: data.date,
      mapName: data.mapName,
      serverIp: data.serverIp,
      serverName: data.serverName,
      fileName: data.fileName,
      redScore,
      blueScore,
      duration,
      matchPlayers: {
        create: data.players.map((player) => ({
          clientNumber: player.clientNumber,
          team: player.team,
          nameClean: player.nameClean,
          nameRaw: player.nameRaw,
          score: player.score,
          captures: player.captures,
          returns: player.returns,
          baseCaptures: player.baseCaptures,
          assists: player.assists,
          flagHold: player.flagHold,
          flagGrabs: player.flagGrabs,
          kills: player.kills,
          deaths: player.deaths,
          ping: player.ping,
          time: player.time,
        })),
      },
    },
    select: { id: true },
  });
  
  return match;
}

export async function deleteMatch(id: string): Promise<void> {
  await prisma.match.delete({
    where: { id },
  });
}
