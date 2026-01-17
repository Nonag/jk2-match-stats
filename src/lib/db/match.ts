import prisma from "./client";
import { ParsedMatchData, calculateMatchStats } from "@/lib/utils";

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
  lastNonSpecTeam: string;
  nameClean: string;
  nameRaw: string;

  // Score stats
  scoreCurrent: number;
  scoreSum: number;

  // CTF stats
  capturesCurrent: number;
  capturesSum: number;
  returnsCurrent: number;
  returnsSum: number;
  bcCurrent: number;
  bcSum: number;
  assistsCurrent: number;
  assistsSum: number;

  // Flag stats
  flagHoldCurrent: number;
  flagHoldSum: number;
  flagGrabsCurrent: number;
  flagGrabsSum: number;

  // Legacy stats
  gauntletCurrent: number;
  gauntletSum: number;
  spreeKillsCurrent: number;
  spreeKillsSum: number;

  // Mine stats
  mineGrabsTotal: number;
  mineGrabsRedBase: number;
  mineGrabsBlueBase: number;
  mineGrabsNeutral: number;

  // Combat stats
  accuracyWeird: number;
  kills: number;
  deaths: number;
  totalKillsMoh: number;

  // Connection stats
  pingCurrent: number;
  pingMean: number;
  pingMeanDeviation: number;
  timeCurrent: number;
  timeSum: number;

  // Rating stats
  glicko2Rating: number;
  glicko2Deviation: number;

  // Kill/Return breakdown
  dfaKills: number;
  dfaReturns: number;
  redKills: number;
  redReturns: number;
  yelKills: number;
  yelReturns: number;
  bluKills: number;
  bluReturns: number;
  dbsKills: number;
  dbsReturns: number;
  dbsAttempts: number;
  bsKills: number;
  bsReturns: number;
  mineKills: number;
  mineReturns: number;
  upcutKills: number;
  upcutReturns: number;
  ydfaKills: number;
  ydfaReturns: number;
  blubsKills: number;
  blubsReturns: number;
  doomKills: number;
  doomReturns: number;
  turKills: number;
  turReturns: number;
  unknKills: number;
  unknReturns: number;
  idleKills: number;
  idleReturns: number;

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
          { scoreSum: "desc" },
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
    players: match.matchPlayers.map((matchPlayer) => ({
      id: matchPlayer.id,
      clientNumber: matchPlayer.clientNumber,
      team: matchPlayer.team,
      lastNonSpecTeam: matchPlayer.lastNonSpecTeam,
      nameClean: matchPlayer.nameClean,
      nameRaw: matchPlayer.nameRaw,

      scoreCurrent: matchPlayer.scoreCurrent,
      scoreSum: matchPlayer.scoreSum,

      capturesCurrent: matchPlayer.capturesCurrent,
      capturesSum: matchPlayer.capturesSum,
      returnsCurrent: matchPlayer.returnsCurrent,
      returnsSum: matchPlayer.returnsSum,
      bcCurrent: matchPlayer.bcCurrent,
      bcSum: matchPlayer.bcSum,
      assistsCurrent: matchPlayer.assistsCurrent,
      assistsSum: matchPlayer.assistsSum,

      flagHoldCurrent: matchPlayer.flagHoldCurrent,
      flagHoldSum: matchPlayer.flagHoldSum,
      flagGrabsCurrent: matchPlayer.flagGrabsCurrent,
      flagGrabsSum: matchPlayer.flagGrabsSum,

      gauntletCurrent: matchPlayer.gauntletCurrent,
      gauntletSum: matchPlayer.gauntletSum,
      spreeKillsCurrent: matchPlayer.spreeKillsCurrent,
      spreeKillsSum: matchPlayer.spreeKillsSum,

      mineGrabsTotal: matchPlayer.mineGrabsTotal,
      mineGrabsRedBase: matchPlayer.mineGrabsRedBase,
      mineGrabsBlueBase: matchPlayer.mineGrabsBlueBase,
      mineGrabsNeutral: matchPlayer.mineGrabsNeutral,

      accuracyWeird: matchPlayer.accuracyWeird,
      kills: matchPlayer.kills,
      deaths: matchPlayer.deaths,
      totalKillsMoh: matchPlayer.totalKillsMoh,

      pingCurrent: matchPlayer.pingCurrent,
      pingMean: matchPlayer.pingMean,
      pingMeanDeviation: matchPlayer.pingMeanDeviation,
      timeCurrent: matchPlayer.timeCurrent,
      timeSum: matchPlayer.timeSum,

      glicko2Rating: matchPlayer.glicko2Rating,
      glicko2Deviation: matchPlayer.glicko2Deviation,

      dfaKills: matchPlayer.dfaKills,
      dfaReturns: matchPlayer.dfaReturns,
      redKills: matchPlayer.redKills,
      redReturns: matchPlayer.redReturns,
      yelKills: matchPlayer.yelKills,
      yelReturns: matchPlayer.yelReturns,
      bluKills: matchPlayer.bluKills,
      bluReturns: matchPlayer.bluReturns,
      dbsKills: matchPlayer.dbsKills,
      dbsReturns: matchPlayer.dbsReturns,
      dbsAttempts: matchPlayer.dbsAttempts,
      bsKills: matchPlayer.bsKills,
      bsReturns: matchPlayer.bsReturns,
      mineKills: matchPlayer.mineKills,
      mineReturns: matchPlayer.mineReturns,
      upcutKills: matchPlayer.upcutKills,
      upcutReturns: matchPlayer.upcutReturns,
      ydfaKills: matchPlayer.ydfaKills,
      ydfaReturns: matchPlayer.ydfaReturns,
      blubsKills: matchPlayer.blubsKills,
      blubsReturns: matchPlayer.blubsReturns,
      doomKills: matchPlayer.doomKills,
      doomReturns: matchPlayer.doomReturns,
      turKills: matchPlayer.turKills,
      turReturns: matchPlayer.turReturns,
      unknKills: matchPlayer.unknKills,
      unknReturns: matchPlayer.unknReturns,
      idleKills: matchPlayer.idleKills,
      idleReturns: matchPlayer.idleReturns,

      playerId: matchPlayer.playerId,
      playerPrimaryName: matchPlayer.player?.primaryName ?? null,
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
          lastNonSpecTeam: player.lastNonSpecTeam,
          nameClean: player.nameClean,
          nameRaw: player.nameRaw,

          scoreCurrent: player.scoreCurrent,
          scoreSum: player.scoreSum,

          capturesCurrent: player.capturesCurrent,
          capturesSum: player.capturesSum,
          returnsCurrent: player.returnsCurrent,
          returnsSum: player.returnsSum,
          bcCurrent: player.bcCurrent,
          bcSum: player.bcSum,
          assistsCurrent: player.assistsCurrent,
          assistsSum: player.assistsSum,

          flagHoldCurrent: player.flagHoldCurrent,
          flagHoldSum: player.flagHoldSum,
          flagGrabsCurrent: player.flagGrabsCurrent,
          flagGrabsSum: player.flagGrabsSum,

          gauntletCurrent: player.gauntletCurrent,
          gauntletSum: player.gauntletSum,
          spreeKillsCurrent: player.spreeKillsCurrent,
          spreeKillsSum: player.spreeKillsSum,

          mineGrabsTotal: player.mineGrabsTotal,
          mineGrabsRedBase: player.mineGrabsRedBase,
          mineGrabsBlueBase: player.mineGrabsBlueBase,
          mineGrabsNeutral: player.mineGrabsNeutral,

          accuracyWeird: player.accuracyWeird,
          kills: player.kills,
          deaths: player.deaths,
          totalKillsMoh: player.totalKillsMoh,

          pingCurrent: player.pingCurrent,
          pingMean: player.pingMean,
          pingMeanDeviation: player.pingMeanDeviation,
          timeCurrent: player.timeCurrent,
          timeSum: player.timeSum,

          glicko2Rating: player.glicko2Rating,
          glicko2Deviation: player.glicko2Deviation,

          dfaKills: player.dfaKills,
          dfaReturns: player.dfaReturns,
          redKills: player.redKills,
          redReturns: player.redReturns,
          yelKills: player.yelKills,
          yelReturns: player.yelReturns,
          bluKills: player.bluKills,
          bluReturns: player.bluReturns,
          dbsKills: player.dbsKills,
          dbsReturns: player.dbsReturns,
          dbsAttempts: player.dbsAttempts,
          bsKills: player.bsKills,
          bsReturns: player.bsReturns,
          mineKills: player.mineKills,
          mineReturns: player.mineReturns,
          upcutKills: player.upcutKills,
          upcutReturns: player.upcutReturns,
          ydfaKills: player.ydfaKills,
          ydfaReturns: player.ydfaReturns,
          blubsKills: player.blubsKills,
          blubsReturns: player.blubsReturns,
          doomKills: player.doomKills,
          doomReturns: player.doomReturns,
          turKills: player.turKills,
          turReturns: player.turReturns,
          unknKills: player.unknKills,
          unknReturns: player.unknReturns,
          idleKills: player.idleKills,
          idleReturns: player.idleReturns,
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
