"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { matchesColumns } from "./matches-columns";
import type { MatchSummary } from "@/lib/api/matches";

interface MatchesTableProps {
  matches: MatchSummary[];
  loading?: boolean;
}

export function MatchesTable({ matches, loading }: MatchesTableProps) {
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
      columns={matchesColumns}
      data={matches}
      searchKey="mapName"
      searchPlaceholder="Filter by map..."
      onRowClick={(match) => router.push(`/matches/${match.id}`)}
    />
  );
}
