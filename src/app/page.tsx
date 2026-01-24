"use client";

import { SectionCards } from "@/components/layout";
import { MatchTable } from "@/components/match";
import { useMatches, useDashboardStats } from "@/lib/queries";

const defaultStat = { current: 0, previous: 0, trend: 0 };
const defaultTotals = { matches: 0, players: 0, avgFlagHold: 0, avgDuration: 0 };

export default function HomePage() {
  const { matches, loading } = useMatches();
  const { stats } = useDashboardStats(7);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards
        matches={stats?.matches ?? defaultStat}
        activePlayers={stats?.activePlayers ?? defaultStat}
        avgFlagHold={stats?.avgFlagHold ?? defaultStat}
        avgDuration={stats?.avgDuration ?? defaultStat}
        totals={stats?.totals ?? defaultTotals}
        days={7}
      />
      <div className="px-4 lg:px-6">
        <MatchTable matches={matches} loading={loading} />
      </div>
    </div>
  );
}
