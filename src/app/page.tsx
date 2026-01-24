"use client";

import { useMemo, useState } from "react";
import { differenceInDays, subDays } from "date-fns";
import { DateRange } from "react-day-picker";

import { SectionCards } from "@/components/layout";
import { DatePreset, MatchTable } from "@/components/match";
import { useMatches, useDashboardStats } from "@/lib/queries";

const defaultStat = { current: 0, previous: 0, trend: 0 };
const defaultTotals = { matches: 0, players: 0, avgFlagHold: 0, avgDuration: 0 };

export default function HomePage() {
  const [datePreset, setDatePreset] = useState<DatePreset>("week");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: subDays(today, 7),
      to: today,
    };
  });

  // Calculate days from date range for stats API
  const days = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 7;
    return differenceInDays(dateRange.to, dateRange.from) || 7;
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
          datePreset={datePreset}
          dateRange={dateRange}
          loading={loading}
          matches={matches}
          onDatePresetChange={setDatePreset}
          onDateRangeChange={setDateRange}
        />
      </div>
    </div>
  );
}
