import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";
import dotenv from "dotenv";

dotenv.config();

interface CSVPlayerRow {
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

interface ParsedPlayer {
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

function parseFileName(fileName: string): {
  date: Date;
  mapName: string;
  serverIp: string;
  serverName: string;
} {
  const baseName = fileName.replace(".csv", "");

  // Support both formats: 2025-12-17_22_56_01 and 2025-04-08 00_42_36
  const dateMatch = baseName.match(/^(\d{4}-\d{2}-\d{2})[_ ](\d{2})_(\d{2})_(\d{2})/);
  if (!dateMatch) {
    throw new Error("Invalid filename format: cannot parse date");
  }

  const [, datePart, hours, minutes, seconds] = dateMatch;
  const date = new Date(`${datePart}T${hours}:${minutes}:${seconds}`);

  const afterDate = baseName.substring(dateMatch[0].length + 1);

  const ipMatch = afterDate.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
  if (!ipMatch) {
    throw new Error("Invalid filename format: cannot parse server IP");
  }

  const serverIp = ipMatch[1];
  const ipIndex = afterDate.indexOf(serverIp);

  const mapName = afterDate.substring(0, ipIndex - 1);

  const afterIp = afterDate.substring(ipIndex + serverIp.length + 1);
  const parts = afterIp.split("_");

  let serverName = "Unknown";
  if (parts.length >= 3) {
    serverName = parts.slice(1, 4).join(" ");
  }

  return { date, mapName, serverIp, serverName };
}

function parseCSV(csvContent: string, fileName: string) {
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

      // Flag stats (newer format)
      flagHoldCurrent: parseInt(row["FLAGHOLD-CURRENT"] || "") || 0,
      flagHoldSum: parseInt(row["FLAGHOLD-SUM"] || "") || 0,
      flagGrabsCurrent: parseInt(row["FLAGGRABS-CURRENT"] || "") || 0,
      flagGrabsSum: parseInt(row["FLAGGRABS-SUM"] || "") || 0,

      // Legacy stats (older format)
      gauntletCurrent: parseInt(row["GAUNTLET-CURRENT"] || "") || 0,
      gauntletSum: parseInt(row["GAUNTLET-SUM"] || "") || 0,
      spreeKillsCurrent: parseInt(row["SPREEKILLS-CURRENT"] || "") || 0,
      spreeKillsSum: parseInt(row["SPREEKILLS-SUM"] || "") || 0,

      // Mine stats
      mineGrabsTotal: parseInt(row["MINEGRABS-TOTAL"]) || 0,
      mineGrabsRedBase: parseInt(row["MINEGRABS-REDBASE"]) || 0,
      mineGrabsBlueBase: parseInt(row["MINEGRABS-BLUEBASE"]) || 0,
      mineGrabsNeutral: parseInt(row["MINEGRABS-NEUTRAL"]) || 0,

      // Combat stats
      accuracyWeird: parseFloat(row["ACCURACY-WEIRD"]) || 0,
      kills: parseInt(row.KILLS) || 0,
      deaths: parseInt(row.DEATHS) || 0,
      totalKillsMoh: parseInt(row["TOTALKILLS-MOH"]) || 0,

      // Connection stats
      pingCurrent: parseInt(row["PING-CURRENT"]) || 0,
      pingMean: parseFloat(row["PING-MEAN"]) || 0,
      pingMeanDeviation: parseFloat(row["PING-MEAN-DEVIATION"]) || 0,
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

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || "file:prisma/dev.db";

  const adapter = new PrismaLibSql({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return new PrismaClient({ adapter });
}

async function main() {
  const prisma = createPrismaClient();

  console.log("Starting seed...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.matchPlayer.deleteMany();
  await prisma.match.deleteMany();
  await prisma.playerAlias.deleteMany();
  await prisma.player.deleteMany();

  // Read sample CSV files from docs/sample-data
  const sampleDataDir = path.join(__dirname, "..", "docs", "sample-data");

  if (!fs.existsSync(sampleDataDir)) {
    console.log("Warning: No sample-data directory found at:", sampleDataDir);
    console.log("Seed completed (no data to import)");
    await prisma.$disconnect();
    return;
  }

  const csvFiles = fs.readdirSync(sampleDataDir).filter((fileName) => fileName.endsWith(".csv"));

  if (csvFiles.length === 0) {
    console.log("Warning: No CSV files found in sample-data directory");
    console.log("Seed completed (no data to import)");
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${csvFiles.length} CSV file(s) to import`);

  for (const csvFile of csvFiles) {
    console.log(`\nProcessing: ${csvFile}`);

    const csvPath = path.join(sampleDataDir, csvFile);
    const csvContent = fs.readFileSync(csvPath, "utf-8");

    const matchData = parseCSV(csvContent, csvFile);

    // Calculate team scores and duration
    const redPlayers = matchData.players.filter((player) => player.team === "Red");
    const bluePlayers = matchData.players.filter((player) => player.team === "Blue");

    const redScore = redPlayers.reduce((sum, player) => sum + player.capturesSum, 0);
    const blueScore = bluePlayers.reduce((sum, player) => sum + player.capturesSum, 0);

    const maxTime = Math.max(...matchData.players.map((player) => player.timeSum));
    const duration = maxTime > 0 ? maxTime : 22; // Default to 22 if no time data

    // Create the match
    const match = await prisma.match.create({
      data: {
        date: matchData.date,
        mapName: matchData.mapName,
        serverIp: matchData.serverIp,
        serverName: matchData.serverName,
        fileName: matchData.fileName,
        redScore,
        blueScore,
        duration,
        matchPlayers: {
          create: matchData.players.map((player) => ({
            // Basic info
            clientNumber: player.clientNumber,
            team: player.team,
            lastNonSpecTeam: player.lastNonSpecTeam,
            nameClean: player.nameClean,
            nameRaw: player.nameRaw,

            // Score stats
            scoreCurrent: player.scoreCurrent,
            scoreSum: player.scoreSum,

            // CTF stats
            capturesCurrent: player.capturesCurrent,
            capturesSum: player.capturesSum,
            returnsCurrent: player.returnsCurrent,
            returnsSum: player.returnsSum,
            bcCurrent: player.bcCurrent,
            bcSum: player.bcSum,
            assistsCurrent: player.assistsCurrent,
            assistsSum: player.assistsSum,

            // Flag stats
            flagHoldCurrent: player.flagHoldCurrent,
            flagHoldSum: player.flagHoldSum,
            flagGrabsCurrent: player.flagGrabsCurrent,
            flagGrabsSum: player.flagGrabsSum,

            // Legacy stats
            gauntletCurrent: player.gauntletCurrent,
            gauntletSum: player.gauntletSum,
            spreeKillsCurrent: player.spreeKillsCurrent,
            spreeKillsSum: player.spreeKillsSum,

            // Mine stats
            mineGrabsTotal: player.mineGrabsTotal,
            mineGrabsRedBase: player.mineGrabsRedBase,
            mineGrabsBlueBase: player.mineGrabsBlueBase,
            mineGrabsNeutral: player.mineGrabsNeutral,

            // Combat stats
            accuracyWeird: player.accuracyWeird,
            kills: player.kills,
            deaths: player.deaths,
            totalKillsMoh: player.totalKillsMoh,

            // Connection stats
            pingCurrent: player.pingCurrent,
            pingMean: player.pingMean,
            pingMeanDeviation: player.pingMeanDeviation,
            timeCurrent: player.timeCurrent,
            timeSum: player.timeSum,

            // Rating stats
            glicko2Rating: player.glicko2Rating,
            glicko2Deviation: player.glicko2Deviation,

            // Kill/Return breakdown
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
    });

    console.log(`  Created match: ${match.mapName} (${redScore}-${blueScore})`);
    console.log(`  Added ${matchData.players.length} players`);
  }

  console.log("\nSeed completed successfully!");

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
