import Papa from "papaparse";

export interface CSVPlayerRow {
  CL: string;
  "LAST-NONSPEC-TEAM": string;
  "CURRENT-TEAM": string;
  "NAME-CLEAN": string;
  "NAME-RAW": string;
  "SCORE-CURRENT": string;
  "SCORE-SUM": string;
  "CAPTURES-CURRENT": string;
  "CAPTURES-SUM": string;
  "RETURNS-CURRENT": string;
  "RETURNS-SUM": string;
  "BC-CURRENT": string;
  "BC-SUM": string;
  "ASSISTS-CURRENT": string;
  "ASSISTS-SUM": string;
  // Newer format columns
  "FLAGHOLD-CURRENT"?: string;
  "FLAGHOLD-SUM"?: string;
  "FLAGGRABS-CURRENT"?: string;
  "FLAGGRABS-SUM"?: string;
  // Older format columns
  "GAUNTLET-CURRENT"?: string;
  "GAUNTLET-SUM"?: string;
  "SPREEKILLS-CURRENT"?: string;
  "SPREEKILLS-SUM"?: string;
  // Mine stats
  "MINEGRABS-TOTAL": string;
  "MINEGRABS-REDBASE": string;
  "MINEGRABS-BLUEBASE": string;
  "MINEGRABS-NEUTRAL": string;
  // Combat stats
  "ACCURACY-WEIRD": string;
  KILLS: string;
  DEATHS: string;
  "TOTALKILLS-MOH": string;
  // Connection stats
  "PING-CURRENT": string;
  "PING-MEAN": string;
  "PING-MEAN-DEVIATION": string;
  "TIME-CURRENT": string;
  "TIME-SUM": string;
  // Rating stats
  "GLICKO2-RATING": string;
  "GLICKO2-DEVIATION": string;
  // Kill/Return breakdown
  "DFA-KILLS": string;
  "DFA-RETURNS": string;
  "DFA-ATTEMPTS": string;
  "RED-KILLS": string;
  "RED-RETURNS": string;
  "YEL-KILLS": string;
  "YEL-RETURNS": string;
  "BLU-KILLS": string;
  "BLU-RETURNS": string;
  "DBS-KILLS": string;
  "DBS-RETURNS": string;
  "DBS-ATTEMPTS": string;
  "BS-KILLS": string;
  "BS-RETURNS": string;
  "BS-ATTEMPTS": string;
  "MINE-KILLS": string;
  "MINE-RETURNS": string;
  "UPCUT-KILLS": string;
  "UPCUT-RETURNS": string;
  "YDFA-KILLS": string;
  "YDFA-RETURNS": string;
  "YDFA-ATTEMPTS": string;
  "BLUBS-KILLS": string;
  "BLUBS-RETURNS": string;
  "BLUBS-ATTEMPTS": string;
  "DOOM-KILLS": string;
  "DOOM-RETURNS": string;
  "TUR-KILLS": string;
  "TUR-RETURNS": string;
  "UNKN-KILLS": string;
  "UNKN-RETURNS": string;
  "IDLE-KILLS": string;
  "IDLE-RETURNS": string;
  // Blocking stats
  "BLOCKS-TEAM": string;
  "BLOCKS-TEAMCAPPER": string;
  "BLOCKS-ENEMY": string;
  "BLOCKS-ENEMYCAPPER": string;
}

export interface ParsedMatchData {
  date: Date;
  mapName: string;
  serverIp: string;
  serverName: string;
  fileName: string;
  players: ParsedPlayer[];
}

export interface ParsedPlayer {
  // Basic info
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

  // Flag stats (newer format)
  flagHoldCurrent: number;
  flagHoldSum: number;
  flagGrabsCurrent: number;
  flagGrabsSum: number;

  // Legacy stats (older format)
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
  dfaAttempts: number;
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
  bsAttempts: number;
  mineKills: number;
  mineReturns: number;
  upcutKills: number;
  upcutReturns: number;
  ydfaKills: number;
  ydfaReturns: number;
  ydfaAttempts: number;
  blubsKills: number;
  blubsReturns: number;
  blubsAttempts: number;
  doomKills: number;
  doomReturns: number;
  turKills: number;
  turReturns: number;
  unknKills: number;
  unknReturns: number;
  idleKills: number;
  idleReturns: number;

  // Blocking stats
  blocksTeam: number;
  blocksTeamCapper: number;
  blocksEnemy: number;
  blocksEnemyCapper: number;
}

export function parseFileName(fileName: string): {
  date: Date;
  mapName: string;
  serverIp: string;
  serverName: string;
} {
  // Example: 2025-12-17_22_56_01_ctf_yavin_no_outside_192.223.24.74_28070_14_7NA2_NWH_14_CTF_NWH_TG_INTERMISSION_SCORES.csv
  // Also:    2025-04-08 00_42_36_ctf_yavin_51.75.78.236_35070_^7# ^3The Force Returns CPT CTF_TG_INTERMISSION_SCORES.csv
  const baseName = fileName.replace(".csv", "");

  // Extract date: supports both 2025-12-17_22_56_01 and 2025-04-08 00_42_36 formats
  const dateMatch = baseName.match(/^(\d{4}-\d{2}-\d{2})[_ ](\d{2})_(\d{2})_(\d{2})/);
  if (!dateMatch) {
    throw new Error("Invalid filename format: cannot parse date");
  }

  const [, datePart, hours, minutes, seconds] = dateMatch;
  const date = new Date(`${datePart}T${hours}:${minutes}:${seconds}`);

  // Remove date prefix
  const afterDate = baseName.substring(dateMatch[0].length + 1); // +1 for the underscore

  // Extract server IP: look for IP pattern like 192.223.24.74
  const ipMatch = afterDate.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
  if (!ipMatch) {
    throw new Error("Invalid filename format: cannot parse server IP");
  }

  const serverIp = ipMatch[1];
  const ipIndex = afterDate.indexOf(serverIp);

  // Map name is everything before the IP
  const mapName = afterDate.substring(0, ipIndex - 1); // -1 for the underscore before IP

  // Server name: extract from parts after port
  // Format: IP_PORT_something_SERVERNAME_...
  const afterIp = afterDate.substring(ipIndex + serverIp.length + 1); // +1 for underscore
  const parts = afterIp.split("_");

  // Skip port (first part), then get server identifier
  // Looking for patterns like "14_7NA2_NWH" -> server name parts
  // The pattern seems to be: PORT_NUMBER_SERVERCODE_SERVERNAME_...
  let serverName = "Unknown";
  if (parts.length >= 3) {
    // Try to extract meaningful server name from parts
    // Typically it's something like NWH (part 3 or 4)
    serverName = parts.slice(1, 4).join(" ");
  }

  return { date, mapName, serverIp, serverName };
}

export function parseCSV(csvContent: string, fileName: string): ParsedMatchData {
  const { date, mapName, serverIp, serverName } = parseFileName(fileName);

  const result = Papa.parse<CSVPlayerRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    console.warn("CSV parsing errors:", result.errors);
  }

  const players: ParsedPlayer[] = result.data
    .filter((row) => row["CURRENT-TEAM"] && row["NAME-CLEAN"])
    .map((row) => ({
      // Basic info
      clientNumber: parseInt(row.CL) || 0,
      team: row["CURRENT-TEAM"],
      lastNonSpecTeam: row["LAST-NONSPEC-TEAM"] || "",
      nameClean: row["NAME-CLEAN"],
      nameRaw: row["NAME-RAW"],

      // Score stats
      scoreCurrent: parseInt(row["SCORE-CURRENT"]) || 0,
      scoreSum: parseInt(row["SCORE-SUM"]) || 0,

      // CTF stats
      capturesCurrent: parseInt(row["CAPTURES-CURRENT"]) || 0,
      capturesSum: parseInt(row["CAPTURES-SUM"]) || 0,
      returnsCurrent: parseInt(row["RETURNS-CURRENT"]) || 0,
      returnsSum: parseInt(row["RETURNS-SUM"]) || 0,
      bcCurrent: parseInt(row["BC-CURRENT"]) || 0,
      bcSum: parseInt(row["BC-SUM"]) || 0,
      assistsCurrent: parseInt(row["ASSISTS-CURRENT"]) || 0,
      assistsSum: parseInt(row["ASSISTS-SUM"]) || 0,

      // Flag stats (newer format - optional)
      flagHoldCurrent: parseInt(row["FLAGHOLD-CURRENT"] || "0") || 0,
      flagHoldSum: parseInt(row["FLAGHOLD-SUM"] || "0") || 0,
      flagGrabsCurrent: parseInt(row["FLAGGRABS-CURRENT"] || "0") || 0,
      flagGrabsSum: parseInt(row["FLAGGRABS-SUM"] || "0") || 0,

      // Legacy stats (older format - optional)
      gauntletCurrent: parseInt(row["GAUNTLET-CURRENT"] || "0") || 0,
      gauntletSum: parseInt(row["GAUNTLET-SUM"] || "0") || 0,
      spreeKillsCurrent: parseInt(row["SPREEKILLS-CURRENT"] || "0") || 0,
      spreeKillsSum: parseInt(row["SPREEKILLS-SUM"] || "0") || 0,

      // Mine stats
      mineGrabsTotal: parseInt(row["MINEGRABS-TOTAL"]) || 0,
      mineGrabsRedBase: parseInt(row["MINEGRABS-REDBASE"]) || 0,
      mineGrabsBlueBase: parseInt(row["MINEGRABS-BLUEBASE"]) || 0,
      mineGrabsNeutral: parseInt(row["MINEGRABS-NEUTRAL"]) || 0,

      // Combat stats
      accuracyWeird: parseInt(row["ACCURACY-WEIRD"]) || 0,
      kills: parseInt(row.KILLS) || 0,
      deaths: parseInt(row.DEATHS) || 0,
      totalKillsMoh: parseInt(row["TOTALKILLS-MOH"]) || 0,

      // Connection stats
      pingCurrent: parseInt(row["PING-CURRENT"]) || 0,
      pingMean: parseInt(row["PING-MEAN"]) || 0,
      pingMeanDeviation: parseInt(row["PING-MEAN-DEVIATION"]) || 0,
      timeCurrent: parseInt(row["TIME-CURRENT"]) || 0,
      timeSum: parseInt(row["TIME-SUM"]) || 0,

      // Rating stats
      glicko2Rating: parseFloat(row["GLICKO2-RATING"]) || 0,
      glicko2Deviation: parseFloat(row["GLICKO2-DEVIATION"]) || 0,

      // Kill/Return breakdown
      dfaKills: parseInt(row["DFA-KILLS"]) || 0,
      dfaReturns: parseInt(row["DFA-RETURNS"]) || 0,
      dfaAttempts: parseInt(row["DFA-ATTEMPTS"]) || 0,
      redKills: parseInt(row["RED-KILLS"]) || 0,
      redReturns: parseInt(row["RED-RETURNS"]) || 0,
      yelKills: parseInt(row["YEL-KILLS"]) || 0,
      yelReturns: parseInt(row["YEL-RETURNS"]) || 0,
      bluKills: parseInt(row["BLU-KILLS"]) || 0,
      bluReturns: parseInt(row["BLU-RETURNS"]) || 0,
      dbsKills: parseInt(row["DBS-KILLS"]) || 0,
      dbsReturns: parseInt(row["DBS-RETURNS"]) || 0,
      dbsAttempts: parseInt(row["DBS-ATTEMPTS"]) || 0,
      bsKills: parseInt(row["BS-KILLS"]) || 0,
      bsReturns: parseInt(row["BS-RETURNS"]) || 0,
      bsAttempts: parseInt(row["BS-ATTEMPTS"]) || 0,
      mineKills: parseInt(row["MINE-KILLS"]) || 0,
      mineReturns: parseInt(row["MINE-RETURNS"]) || 0,
      upcutKills: parseInt(row["UPCUT-KILLS"]) || 0,
      upcutReturns: parseInt(row["UPCUT-RETURNS"]) || 0,
      ydfaKills: parseInt(row["YDFA-KILLS"]) || 0,
      ydfaReturns: parseInt(row["YDFA-RETURNS"]) || 0,
      ydfaAttempts: parseInt(row["YDFA-ATTEMPTS"]) || 0,
      blubsKills: parseInt(row["BLUBS-KILLS"]) || 0,
      blubsReturns: parseInt(row["BLUBS-RETURNS"]) || 0,
      blubsAttempts: parseInt(row["BLUBS-ATTEMPTS"]) || 0,
      doomKills: parseInt(row["DOOM-KILLS"]) || 0,
      doomReturns: parseInt(row["DOOM-RETURNS"]) || 0,
      turKills: parseInt(row["TUR-KILLS"]) || 0,
      turReturns: parseInt(row["TUR-RETURNS"]) || 0,
      unknKills: parseInt(row["UNKN-KILLS"]) || 0,
      unknReturns: parseInt(row["UNKN-RETURNS"]) || 0,
      idleKills: parseInt(row["IDLE-KILLS"]) || 0,
      idleReturns: parseInt(row["IDLE-RETURNS"]) || 0,

      // Blocking stats
      blocksTeam: parseInt(row["BLOCKS-TEAM"]) || 0,
      blocksTeamCapper: parseInt(row["BLOCKS-TEAMCAPPER"]) || 0,
      blocksEnemy: parseInt(row["BLOCKS-ENEMY"]) || 0,
      blocksEnemyCapper: parseInt(row["BLOCKS-ENEMYCAPPER"]) || 0,
    }));

  return {
    date,
    mapName,
    serverIp,
    serverName,
    fileName,
    players,
  };
}

export function calculateMatchStats(players: ParsedPlayer[]): {
  redScore: number;
  blueScore: number;
  duration: number;
} {
  const redPlayers = players.filter((player) => player.team === "Red");
  const bluePlayers = players.filter((player) => player.team === "Blue");

  const redScore = redPlayers.reduce((sum, player) => sum + player.capturesSum, 0);
  const blueScore = bluePlayers.reduce((sum, player) => sum + player.capturesSum, 0);

  // Duration is the longest time of any player
  const duration = Math.max(...players.map((player) => player.timeSum), 0);

  return { redScore, blueScore, duration };
}
