"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { matchPlayersColumns } from "./match-players-columns";
import type { MatchPlayerDetail } from "@/lib/db/match";

interface MatchPlayersTableProps {
  players: MatchPlayerDetail[];
  team: "Red" | "Blue";
}

function getTeamStyles(team: "Red" | "Blue") {
  if (team === "Red") {
    return {
      badge: "bg-red-500 hover:bg-red-600",
    };
  }
  return {
    badge: "bg-blue-500 hover:bg-blue-600",
  };
}

export function MatchPlayersTable({ players, team }: MatchPlayersTableProps) {
  const teamPlayers = players.filter((p) => p.team === team);
  const styles = getTeamStyles(team);

  if (teamPlayers.length === 0) {
    return null;
  }

  const totalScore = teamPlayers.reduce((sum, p) => sum + p.score, 0);
  const totalCaptures = teamPlayers.reduce((sum, p) => sum + p.captures, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Badge className={styles.badge}>{team} Team</Badge>
          <span className="text-muted-foreground text-sm font-normal">
            {totalCaptures} captures • {totalScore} total score
          </span>
        </h3>
      </div>
      <DataTable
        columns={matchPlayersColumns}
        data={teamPlayers}
        searchKey="nameClean"
        searchPlaceholder="Filter by player..."
      />
    </div>
  );
}
