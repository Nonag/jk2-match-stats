"use client";

import { DataTable } from "@/components/ui/data-table";
import { playersColumns } from "./players-columns";
import type { PlayerWithAliases } from "@/lib/api/players";

interface PlayersTableProps {
  players: PlayerWithAliases[];
  loading?: boolean;
}

export function PlayersTable({ players, loading }: PlayersTableProps) {
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
      columns={playersColumns}
      data={players}
      searchKey="primaryName"
      searchPlaceholder="Filter by name..."
    />
  );
}
