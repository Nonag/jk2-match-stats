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

interface ParsedPlayer {
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
}

function parseFileName(fileName: string): {
  date: Date;
  mapName: string;
  serverIp: string;
  serverName: string;
} {
  const baseName = fileName.replace(".csv", "");

  const dateMatch = baseName.match(/^(\d{4}-\d{2}-\d{2})_(\d{2})_(\d{2})_(\d{2})/);
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
      clientNumber: parseInt(row.CL) || 0,
      team: row["CURRENT-TEAM"],
      nameClean: row["NAME-CLEAN"],
      nameRaw: row["NAME-RAW"],
      score: parseInt(row["SCORE-SUM"]) || 0,
      captures: parseInt(row["CAPTURES-SUM"]) || 0,
      returns: parseInt(row["RETURNS-SUM"]) || 0,
      baseCaptures: parseInt(row["BC-SUM"]) || 0,
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

  const csvFiles = fs.readdirSync(sampleDataDir).filter((f) => f.endsWith(".csv"));

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
    const redPlayers = matchData.players.filter((p) => p.team === "Red");
    const bluePlayers = matchData.players.filter((p) => p.team === "Blue");

    const redScore = redPlayers.reduce((sum, p) => sum + p.captures, 0);
    const blueScore = bluePlayers.reduce((sum, p) => sum + p.captures, 0);

    const maxTime = Math.max(...matchData.players.map((p) => p.time));
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
    });

    console.log(`  Created match: ${match.mapName} (${redScore}-${blueScore})`);
    console.log(`  Added ${matchData.players.length} players`);
  }

  console.log("\nSeed completed successfully!");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
