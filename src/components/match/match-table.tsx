"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { matchColumns } from "./match-columns";
import type { MatchSummary } from "@/lib/db/match";

interface MatchTableProps {
  loading?: boolean;
  matches: MatchSummary[];
}

export function MatchTable({ matches, loading }: MatchTableProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading matches...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">
          No matches found. Import a CSV file to get started.
        </p>
      </div>
    );
  }

  return (
    <DataTable
      columns={matchColumns}
      data={matches}
      onRowClick={(match) => router.push(`/matches/${match.id}`)}
      searchKey="mapName"
      searchPlaceholder="Filter by map..."
    />
  );
}
