import prisma from "./client";
import { ParsedMatchData, calculateMatchStats } from "@/lib/utils";

export interface MatchDetail {
  blueScore: number;
  date: Date;
  duration: number;
  fileName: string;
  id: string;
  mapName: string;
  players: MatchPlayerDetail[];
  redScore: number;
  serverIp: string;
  serverName: string;
}

export interface MatchPlayerDetail {
  accuracyWeird: number;
  assistsCurrent: number;
  assistsSum: number;
  bcCurrent: number;
  bcSum: number;
  blocksEnemy: number;
  blocksEnemyCapper: number;
  blocksTeam: number;
  blocksTeamCapper: number;
  blubsAttempts: number;
  blubsKills: number;
  blubsReturns: number;
  bluKills: number;
  bluReturns: number;
  bsAttempts: number;
  bsKills: number;
  bsReturns: number;
  capturesCurrent: number;
  capturesSum: number;
  clientNumber: number;
  dbsAttempts: number;
  dbsKills: number;
  dbsReturns: number;
  deaths: number;
  dfaAttempts: number;
  dfaKills: number;
  dfaReturns: number;
  doomKills: number;
  doomReturns: number;
  flagGrabsCurrent: number;
  flagGrabsSum: number;
  flagHoldCurrent: number;
  flagHoldSum: number;
  gauntletCurrent: number;
  gauntletSum: number;
  glicko2Deviation: number;
  glicko2Rating: number;
  id: string;
  idleKills: number;
  idleReturns: number;
  kills: number;
  lastNonSpecTeam: string;
  mineGrabsBlueBase: number;
  mineGrabsNeutral: number;
  mineGrabsRedBase: number;
  mineGrabsTotal: number;
  mineKills: number;
  mineReturns: number;
  nameClean: string;
  nameRaw: string;
  pingCurrent: number;
  pingMean: number;
  pingMeanDeviation: number;
  playerId: string | null;
  playerPrimaryName: string | null;
  redKills: number;
  redReturns: number;
  returnsCurrent: number;
  returnsSum: number;
  scoreCurrent: number;
  scoreSum: number;
  spreeKillsCurrent: number;
  spreeKillsSum: number;
  team: string;
  timeCurrent: number;
  timeSum: number;
  totalKillsMoh: number;
  turKills: number;
  turReturns: number;
  unknKills: number;
  unknReturns: number;
  upcutKills: number;
  upcutReturns: number;
  ydfaAttempts: number;
  ydfaKills: number;
  ydfaReturns: number;
  yelKills: number;
  yelReturns: number;
}

export interface MatchSummary {
  blueScore: number;
  date: Date;
  duration: number;
  id: string;
  mapName: string;
  redScore: number;
  serverName: string;
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
      dfaAttempts: matchPlayer.dfaAttempts,
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
      bsAttempts: matchPlayer.bsAttempts,
      mineKills: matchPlayer.mineKills,
      mineReturns: matchPlayer.mineReturns,
      upcutKills: matchPlayer.upcutKills,
      upcutReturns: matchPlayer.upcutReturns,
      ydfaKills: matchPlayer.ydfaKills,
      ydfaReturns: matchPlayer.ydfaReturns,
      ydfaAttempts: matchPlayer.ydfaAttempts,
      blubsKills: matchPlayer.blubsKills,
      blubsReturns: matchPlayer.blubsReturns,
      blubsAttempts: matchPlayer.blubsAttempts,
      doomKills: matchPlayer.doomKills,
      doomReturns: matchPlayer.doomReturns,
      turKills: matchPlayer.turKills,
      turReturns: matchPlayer.turReturns,
      unknKills: matchPlayer.unknKills,
      unknReturns: matchPlayer.unknReturns,
      idleKills: matchPlayer.idleKills,
      idleReturns: matchPlayer.idleReturns,

      // Blocking stats
      blocksTeam: matchPlayer.blocksTeam,
      blocksTeamCapper: matchPlayer.blocksTeamCapper,
      blocksEnemy: matchPlayer.blocksEnemy,
      blocksEnemyCapper: matchPlayer.blocksEnemyCapper,

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
          dfaAttempts: player.dfaAttempts,
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
          bsAttempts: player.bsAttempts,
          mineKills: player.mineKills,
          mineReturns: player.mineReturns,
          upcutKills: player.upcutKills,
          upcutReturns: player.upcutReturns,
          ydfaKills: player.ydfaKills,
          ydfaReturns: player.ydfaReturns,
          ydfaAttempts: player.ydfaAttempts,
          blubsKills: player.blubsKills,
          blubsReturns: player.blubsReturns,
          blubsAttempts: player.blubsAttempts,
          doomKills: player.doomKills,
          doomReturns: player.doomReturns,
          turKills: player.turKills,
          turReturns: player.turReturns,
          unknKills: player.unknKills,
          unknReturns: player.unknReturns,
          idleKills: player.idleKills,
          idleReturns: player.idleReturns,

          // Blocking stats
          blocksTeam: player.blocksTeam,
          blocksTeamCapper: player.blocksTeamCapper,
          blocksEnemy: player.blocksEnemy,
          blocksEnemyCapper: player.blocksEnemyCapper,
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

// ============================================================================
// Stats Queries - Each stat has dedicated query with optional date range
// ============================================================================

export interface DateRange {
  from: Date;
  to: Date;
}

export interface StatWithTrend<T> {
  current: T;
  previous: T;
  trend: number;
}

/**
 * Get match count for a date range
 */
export async function getMatchCount(range?: DateRange): Promise<number> {
  return prisma.match.count({
    where: range ? { date: { gte: range.from, lt: range.to } } : undefined,
  });
}

/**
 * Get unique active players for a date range (players who participated in matches)
 */
export async function getActivePlayerCount(range?: DateRange): Promise<number> {
  const result = await prisma.matchPlayer.findMany({
    where: range
      ? { match: { date: { gte: range.from, lt: range.to } } }
      : undefined,
    select: { playerId: true },
    distinct: ["playerId"],
  });
  // Filter out null playerIds (unlinked players)
  return result.filter((r) => r.playerId !== null).length;
}

/**
 * Get average flag hold per grab (in milliseconds) for a date range
 */
export async function getAvgFlagHoldPerGrab(range?: DateRange): Promise<number> {
  const flagStats = await prisma.matchPlayer.aggregate({
    where: range
      ? { match: { date: { gte: range.from, lt: range.to } } }
      : undefined,
    _sum: {
      flagHoldSum: true,
      flagGrabsSum: true,
    },
  });

  const totalFlagHold = flagStats._sum.flagHoldSum ?? 0;
  const totalFlagGrabs = flagStats._sum.flagGrabsSum ?? 0;
  return totalFlagGrabs > 0 ? Math.round(totalFlagHold / totalFlagGrabs) : 0;
}

/**
 * Get average match duration (in minutes) for a date range
 */
export async function getAvgMatchDuration(range?: DateRange): Promise<number> {
  const result = await prisma.match.aggregate({
    where: range ? { date: { gte: range.from, lt: range.to } } : undefined,
    _avg: { duration: true },
  });
  return Math.round(result._avg.duration ?? 0);
}

/**
 * Helper to calculate trend percentage
 */
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Get stat with comparison to previous period
 */
export async function getStatWithTrend<T extends number>(
  queryFn: (range?: DateRange) => Promise<T>,
  currentRange: DateRange,
  previousRange: DateRange
): Promise<StatWithTrend<T>> {
  const [current, previous] = await Promise.all([
    queryFn(currentRange),
    queryFn(previousRange),
  ]);

  return {
    current,
    previous,
    trend: calculateTrend(current, previous),
  };
}

/**
 * Create date ranges for "last N days" vs "N days before that"
 */
export function createComparisonRanges(days: number): { current: DateRange; previous: DateRange } {
  const now = new Date();

  // Current period: from (now - days) to now
  const currentTo = new Date(now);
  const currentFrom = new Date(now);
  currentFrom.setDate(currentFrom.getDate() - days);

  // Previous period: from (now - 2*days) to (now - days)
  const previousTo = new Date(currentFrom);
  const previousFrom = new Date(currentFrom);
  previousFrom.setDate(previousFrom.getDate() - days);

  return {
    current: { from: currentFrom, to: currentTo },
    previous: { from: previousFrom, to: previousTo },
  };
}

export interface DashboardStats {
  activePlayers: StatWithTrend<number>;
  avgDuration: StatWithTrend<number>;
  avgFlagHold: StatWithTrend<number>;
  matches: StatWithTrend<number>;
  totals: {
    avgDuration: number;
    avgFlagHold: number;
    matches: number;
    players: number;
  };
}

/**
 * Get all dashboard stats with totals and 7-day trends
 */
export async function getDashboardStats(days: number = 7): Promise<DashboardStats> {
  const { current, previous } = createComparisonRanges(days);

  const [matches, activePlayers, avgFlagHold, avgDuration, totalMatches, totalPlayers, totalAvgFlagHold, totalAvgDuration] = await Promise.all([
    getStatWithTrend(getMatchCount, current, previous),
    getStatWithTrend(getActivePlayerCount, current, previous),
    getStatWithTrend(getAvgFlagHoldPerGrab, current, previous),
    getStatWithTrend(getAvgMatchDuration, current, previous),
    getMatchCount(),
    prisma.player.count(),
    getAvgFlagHoldPerGrab(),
    getAvgMatchDuration(),
  ]);

  return {
    activePlayers,
    avgDuration,
    avgFlagHold,
    matches,
    totals: {
      avgDuration: totalAvgDuration,
      avgFlagHold: totalAvgFlagHold,
      matches: totalMatches,
      players: totalPlayers,
    },
  };
}
