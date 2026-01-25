import prisma from "./client";
import { ParsedMatchData, calculateMatchStats } from "@/lib/utils";

// ============================================================================
// Interfaces
// ============================================================================

export interface DateRange {
  from: Date;
  to: Date;
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

// Extends MatchStats with identity/metadata fields
export interface MatchPlayerDetail extends MatchStats {
  clientNumber: number;
  id: string;
  lastNonSpecTeam: string;
  nameClean: string;
  nameRaw: string;
  playerAlias: string | null;
  playerId: string | null;
  team: string;
}

// Numeric match statistics - used for both individual MatchPlayer stats and aggregated Player.matchStats
export interface MatchStats {
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
  idleKills: number;
  idleReturns: number;
  kills: number;
  mineGrabsBlueBase: number;
  mineGrabsNeutral: number;
  mineGrabsRedBase: number;
  mineGrabsTotal: number;
  mineKills: number;
  mineReturns: number;
  pingCurrent: number;
  pingMean: number;
  pingMeanDeviation: number;
  redKills: number;
  redReturns: number;
  returnsCurrent: number;
  returnsSum: number;
  scoreCurrent: number;
  scoreSum: number;
  spreeKillsCurrent: number;
  spreeKillsSum: number;
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

export interface StatWithTrend<T> {
  current: T;
  previous: T;
  trend: number;
}

// ============================================================================
// Constants
// ============================================================================

// All keys of MatchStats for iteration
export const matchStatsKeys: (keyof MatchStats)[] = [
  "accuracyWeird",
  "assistsCurrent",
  "assistsSum",
  "bcCurrent",
  "bcSum",
  "blocksEnemy",
  "blocksEnemyCapper",
  "blocksTeam",
  "blocksTeamCapper",
  "blubsAttempts",
  "blubsKills",
  "blubsReturns",
  "bluKills",
  "bluReturns",
  "bsAttempts",
  "bsKills",
  "bsReturns",
  "capturesCurrent",
  "capturesSum",
  "dbsAttempts",
  "dbsKills",
  "dbsReturns",
  "deaths",
  "dfaAttempts",
  "dfaKills",
  "dfaReturns",
  "doomKills",
  "doomReturns",
  "flagGrabsCurrent",
  "flagGrabsSum",
  "flagHoldCurrent",
  "flagHoldSum",
  "gauntletCurrent",
  "gauntletSum",
  "glicko2Deviation",
  "glicko2Rating",
  "idleKills",
  "idleReturns",
  "kills",
  "mineGrabsBlueBase",
  "mineGrabsNeutral",
  "mineGrabsRedBase",
  "mineGrabsTotal",
  "mineKills",
  "mineReturns",
  "pingCurrent",
  "pingMean",
  "pingMeanDeviation",
  "redKills",
  "redReturns",
  "returnsCurrent",
  "returnsSum",
  "scoreCurrent",
  "scoreSum",
  "spreeKillsCurrent",
  "spreeKillsSum",
  "timeCurrent",
  "timeSum",
  "totalKillsMoh",
  "turKills",
  "turReturns",
  "unknKills",
  "unknReturns",
  "upcutKills",
  "upcutReturns",
  "ydfaAttempts",
  "ydfaKills",
  "ydfaReturns",
  "yelKills",
  "yelReturns",
];

// ============================================================================
// MatchStats Helper Functions
// ============================================================================

// Create empty stats object with all zeros
export function createEmptyMatchStats(): MatchStats {
  return Object.fromEntries(
    matchStatsKeys.map((key) => [key, 0]),
  ) as unknown as MatchStats;
}

// Extract MatchStats from a MatchPlayer-like object
export function extractMatchStats<T extends Record<string, unknown>>(
  obj: T,
): MatchStats {
  const result = createEmptyMatchStats();
  for (const key of matchStatsKeys) {
    if (key in obj && typeof obj[key] === "number") {
      result[key] = obj[key] as number;
    }
  }
  return result;
}

// Sum multiple MatchStats objects
export function sumMatchStats(statsArray: MatchStats[]): MatchStats {
  const result = createEmptyMatchStats();
  for (const stats of statsArray) {
    for (const key of matchStatsKeys) {
      result[key] += stats[key] ?? 0;
    }
  }
  return result;
}

// ============================================================================
// Match CRUD Functions
// ============================================================================

export async function checkMatchExists(fileName: string): Promise<boolean> {
  const match = await prisma.match.findUnique({
    where: { fileName },
    select: { id: true },
  });
  return match !== null;
}

export async function deleteMatch(id: string): Promise<void> {
  await prisma.match.delete({
    where: { id },
  });
}

export async function getAllMatches(): Promise<MatchSummary[]> {
  const matches = await prisma.match.findMany({
    orderBy: { date: "desc" },
    select: {
      blueScore: true,
      date: true,
      duration: true,
      id: true,
      mapName: true,
      redScore: true,
      serverName: true,
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
              aliasPrimary: true,
            },
          },
        },
        orderBy: [{ team: "asc" }, { scoreSum: "desc" }],
      },
    },
  });

  if (!match) return null;

  return {
    blueScore: match.blueScore,
    date: match.date,
    duration: match.duration,
    fileName: match.fileName,
    id: match.id,
    mapName: match.mapName,
    players: match.matchPlayers.map(
      ({ player, matchId: _matchId, ...rest }) => ({
        ...rest,
        playerAlias: player?.aliasPrimary ?? null,
      }),
    ),
    redScore: match.redScore,
    serverIp: match.serverIp,
    serverName: match.serverName,
  };
}

export async function importMatch(
  data: ParsedMatchData,
): Promise<{ id: string }> {
  const { redScore, blueScore, duration } = calculateMatchStats(data.players);

  const match = await prisma.match.create({
    data: {
      blueScore,
      date: data.date,
      duration,
      fileName: data.fileName,
      mapName: data.mapName,
      matchPlayers: { create: data.players },
      redScore,
      serverIp: data.serverIp,
      serverName: data.serverName,
    },
    select: { id: true },
  });

  return match;
}

// ============================================================================
// Stats Query Functions
// ============================================================================

/**
 * Helper to calculate trend percentage
 */
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Create date ranges for "last N days" vs "N days before that"
 */
export function createComparisonRanges(days: number): {
  current: DateRange;
  previous: DateRange;
} {
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
export async function getAvgFlagHoldPerGrab(
  range?: DateRange,
): Promise<number> {
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
 * Get all dashboard stats with totals and 7-day trends
 */
export async function getDashboardStats(
  days: number = 7,
): Promise<DashboardStats> {
  const { current, previous } = createComparisonRanges(days);

  const [
    matches,
    activePlayers,
    avgFlagHold,
    avgDuration,
    totalMatches,
    totalPlayers,
    totalAvgFlagHold,
    totalAvgDuration,
  ] = await Promise.all([
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

/**
 * Get match count for a date range
 */
export async function getMatchCount(range?: DateRange): Promise<number> {
  return prisma.match.count({
    where: range ? { date: { gte: range.from, lt: range.to } } : undefined,
  });
}

/**
 * Get stat with comparison to previous period
 */
export async function getStatWithTrend<T extends number>(
  queryFn: (range?: DateRange) => Promise<T>,
  currentRange: DateRange,
  previousRange: DateRange,
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
