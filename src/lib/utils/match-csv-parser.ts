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
  "FLAGHOLD-CURRENT": string;
  "FLAGHOLD-SUM": string;
  "FLAGGRABS-CURRENT": string;
  "FLAGGRABS-SUM": string;
  KILLS: string;
  DEATHS: string;
  "PING-CURRENT": string;
  "PING-MEAN": string;
  "TIME-CURRENT": string;
  "TIME-SUM": string;
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
  clientNumber: number;
  team: string;
  nameClean: string;
  nameRaw: string;
  score: number;
  captures: number;
  returns: number;
  baseCleanKills: number;
  assists: number;
  flagHold: number;
  flagGrabs: number;
  kills: number;
  deaths: number;
  ping: number;
  time: number;
}

export function parseFileName(fileName: string): {
  date: Date;
  mapName: string;
  serverIp: string;
  serverName: string;
} {
  // Example: 2025-12-17_22_56_01_ctf_yavin_no_outside_192.223.24.74_28070_14_7NA2_NWH_14_CTF_NWH_TG_INTERMISSION_SCORES.csv
  const baseName = fileName.replace(".csv", "");

  // Extract date: 2025-12-17_22_56_01
  const dateMatch = baseName.match(/^(\d{4}-\d{2}-\d{2})_(\d{2})_(\d{2})_(\d{2})/);
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
      clientNumber: parseInt(row.CL) || 0,
      team: row["CURRENT-TEAM"],
      nameClean: row["NAME-CLEAN"],
      nameRaw: row["NAME-RAW"],
      score: parseInt(row["SCORE-SUM"]) || 0,
      captures: parseInt(row["CAPTURES-SUM"]) || 0,
      returns: parseInt(row["RETURNS-SUM"]) || 0,
      baseCleanKills: parseInt(row["BC-SUM"]) || 0,
      assists: parseInt(row["ASSISTS-SUM"]) || 0,
      flagHold: parseInt(row["FLAGHOLD-SUM"]) || 0,
      flagGrabs: parseInt(row["FLAGGRABS-SUM"]) || 0,
      kills: parseInt(row.KILLS) || 0,
      deaths: parseInt(row.DEATHS) || 0,
      ping: parseInt(row["PING-CURRENT"]) || parseInt(row["PING-MEAN"]) || 0,
      time: parseInt(row["TIME-SUM"]) || 0,
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

  const redScore = redPlayers.reduce((sum, player) => sum + player.captures, 0);
  const blueScore = bluePlayers.reduce((sum, player) => sum + player.captures, 0);

  // Duration is the longest time of any player
  const duration = Math.max(...players.map((player) => player.time), 0);

  return { redScore, blueScore, duration };
}
