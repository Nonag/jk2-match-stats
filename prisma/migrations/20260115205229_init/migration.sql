-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "primaryName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerAlias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameClean" TEXT NOT NULL,
    "nameRaw" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerAlias_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "mapName" TEXT NOT NULL,
    "serverIp" TEXT NOT NULL,
    "serverName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "redScore" INTEGER NOT NULL,
    "blueScore" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MatchPlayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT,
    "clientNumber" INTEGER NOT NULL,
    "team" TEXT NOT NULL,
    "nameClean" TEXT NOT NULL,
    "nameRaw" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "captures" INTEGER NOT NULL,
    "returns" INTEGER NOT NULL,
    "baseCaptures" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "flagHold" INTEGER NOT NULL,
    "flagGrabs" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "ping" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAlias_nameClean_playerId_key" ON "PlayerAlias"("nameClean", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_fileName_key" ON "Match"("fileName");
