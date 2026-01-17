"use client";

import { SectionCards } from "@/components/layout";
import { MatchCSVImportDialog, MatchTable } from "@/components/match";
import { useMatches } from "@/hooks/use-matches";

export default function HomePage() {
  const { matches, loading, refetch } = useMatches();

  // Calculate stats from matches
  const totalMatches = matches.length;
  const totalCaptures = matches.reduce(
    (sum, match) => sum + match.redScore + match.blueScore,
    0
  );
  const avgMatchDuration =
    totalMatches > 0
      ? Math.round(matches.reduce((sum, match) => sum + match.duration, 0) / totalMatches)
      : 0;

  // For unique players, we'd need actual data - using a placeholder based on matches
  const estimatedPlayers = totalMatches * 6;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards
        totalMatches={totalMatches}
        totalPlayers={estimatedPlayers}
        totalCaptures={totalCaptures}
        avgMatchDuration={avgMatchDuration}
      />
      <div className="px-4 lg:px-6">
        <MatchTable matches={matches} loading={loading} />
      </div>
    </div>
  );
}
