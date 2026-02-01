"use client";

import { useMemo, useState } from "react";
import { differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";

import { SectionCards } from "@/components/layout";
import { MatchTable } from "@/components/match";
import { useMatches, useDashboardStats } from "@/lib/queries";

const defaultStat = { current: 0, previous: 0, trend: 0 };
const defaultTotals = { matches: 0, players: 0, avgFlagHold: 0, avgDuration: 0 };

export default function HomePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const days = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return undefined;
    return differenceInDays(dateRange.to, dateRange.from) || 1;
  }, [dateRange]);

  const { matches, loading } = useMatches();
  const { stats } = useDashboardStats(days);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards
        activePlayers={stats?.activePlayers ?? defaultStat}
        avgDuration={stats?.avgDuration ?? defaultStat}
        avgFlagHold={stats?.avgFlagHold ?? defaultStat}
        days={days}
        matches={stats?.matches ?? defaultStat}
        totals={stats?.totals ?? defaultTotals}
      />
      <div className="px-4 lg:px-6">
        <MatchTable
          loading={loading}
          matches={matches}
          onDateRangeChange={setDateRange}
        />
      </div>
    </div>
  );
}
