"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { MatchPlayerDetail } from "@/lib/api/matches";

interface MatchPlayersTableProps {
  players: MatchPlayerDetail[];
  team: "Red" | "Blue";
}

function getTeamStyles(team: "Red" | "Blue") {
  if (team === "Red") {
    return {
      header: "bg-red-500/20 text-red-700 dark:text-red-300",
      badge: "bg-red-500 hover:bg-red-600",
    };
  }
  return {
    header: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
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
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className={styles.header}>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Caps</TableHead>
              <TableHead className="text-right">Ret</TableHead>
              <TableHead className="text-right">BC</TableHead>
              <TableHead className="text-right">Ast</TableHead>
              <TableHead className="text-right">K</TableHead>
              <TableHead className="text-right">D</TableHead>
              <TableHead className="text-right">K/D</TableHead>
              <TableHead className="text-right">Time</TableHead>
              <TableHead className="text-right">Ping</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamPlayers.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="text-muted-foreground">
                  {player.clientNumber}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{player.nameClean}</span>
                    {player.playerPrimaryName && player.playerPrimaryName !== player.nameClean && (
                      <span className="text-xs text-muted-foreground">
                        aka {player.playerPrimaryName}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{player.score}</TableCell>
                <TableCell className="text-right font-semibold">
                  {player.captures}
                </TableCell>
                <TableCell className="text-right">{player.returns}</TableCell>
                <TableCell className="text-right">{player.baseCaptures}</TableCell>
                <TableCell className="text-right">{player.assists}</TableCell>
                <TableCell className="text-right">{player.kills}</TableCell>
                <TableCell className="text-right">{player.deaths}</TableCell>
                <TableCell className="text-right">
                  {player.deaths > 0
                    ? (player.kills / player.deaths).toFixed(2)
                    : player.kills.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">{player.time}m</TableCell>
                <TableCell className="text-right">{player.ping}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
