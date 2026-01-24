"use client";

import { DataTable } from "@/components/ui/data-table";
import { playerColumns } from "./player-columns";
import type { PlayerWithAliases } from "@/lib/db/player";

interface PlayerTableProps {
  loading?: boolean;
  players: PlayerWithAliases[];
}

export function PlayerTable({ players, loading }: PlayerTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading players...</p>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">
          No players found. Import match data to see players.
        </p>
      </div>
    );
  }

  return (
    <DataTable
      columns={playerColumns}
      data={players}
      searchKey="primaryName"
      searchPlaceholder="Filter by name..."
    />
  );
}
