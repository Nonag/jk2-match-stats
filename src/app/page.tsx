"use client";

import { PageHeader } from "@/components/layout";
import { CSVImportDialog, MatchesTable } from "@/components/matches";
import { useMatches } from "@/hooks/use-matches";

export default function HomePage() {
  const { matches, loading, refetch } = useMatches();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matches"
        description="View and manage JK2 CTF match statistics"
      >
        <CSVImportDialog onImportSuccess={refetch} />
      </PageHeader>
      <MatchesTable matches={matches} loading={loading} />
    </div>
  );
}
