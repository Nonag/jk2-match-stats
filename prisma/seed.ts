import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { parseCSV } from "../src/lib/utils/match-csv-parser";

dotenv.config();

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

  const csvFiles = fs
    .readdirSync(sampleDataDir)
    .filter((fileName) => fileName.endsWith(".csv"));

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
    const redPlayers = matchData.players.filter(
      (player) => player.team === "Red",
    );
    const bluePlayers = matchData.players.filter(
      (player) => player.team === "Blue",
    );

    const redScore = redPlayers.reduce(
      (sum, player) => sum + player.capturesSum,
      0,
    );
    const blueScore = bluePlayers.reduce(
      (sum, player) => sum + player.capturesSum,
      0,
    );

    const maxTime = Math.max(
      ...matchData.players.map((player) => player.timeSum),
    );
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
