import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatDuration, formatPeriod } from "@/lib/utils"
import type { StatWithTrend } from "@/lib/db/match"

interface SectionCardsProps {
  activePlayers: StatWithTrend<number>;
  avgDuration: StatWithTrend<number>;
  avgFlagHold: StatWithTrend<number>;
  days: number;
  matches: StatWithTrend<number>;
  totals: {
    avgDuration: number;
    avgFlagHold: number;
    matches: number;
    players: number;
  };
}

function TrendBadge({ trend, previousValue, days }: { trend: number; previousValue: string; days: number }) {
  if (trend === 0) {
    return null;
  }

  const isUp = trend > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline">
          {isUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
          {isUp ? "+" : ""}{trend}%
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {previousValue} {formatPeriod(days, "previous")}
      </TooltipContent>
    </Tooltip>
  );
}

export function SectionCards({
  activePlayers,
  avgDuration,
  avgFlagHold,
  days,
  matches,
  totals,
}: SectionCardsProps) {
  const periodLabel = formatPeriod(days);
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Players</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totals.players}
          </CardTitle>
          <CardAction>
            <TrendBadge trend={activePlayers.trend} previousValue={String(activePlayers.previous)} days={days} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {activePlayers.current} active {periodLabel} {activePlayers.trend !== 0 && (activePlayers.trend > 0 ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />)}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Matches</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totals.matches}
          </CardTitle>
          <CardAction>
            <TrendBadge trend={matches.trend} previousValue={String(matches.previous)} days={days} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {matches.current} {periodLabel} {matches.trend !== 0 && (matches.trend > 0 ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />)}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average Flag Hold per Grab</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatDuration(totals.avgFlagHold)}
          </CardTitle>
          <CardAction>
            <TrendBadge trend={avgFlagHold.trend} previousValue={formatDuration(avgFlagHold.previous)} days={days} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {formatDuration(avgFlagHold.current)} {periodLabel} {avgFlagHold.trend !== 0 && (avgFlagHold.trend > 0 ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />)}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average Match Duration</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totals.avgDuration}m
          </CardTitle>
          <CardAction>
            <TrendBadge trend={avgDuration.trend} previousValue={`${avgDuration.previous}m`} days={days} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {avgDuration.current}m {periodLabel} {avgDuration.trend !== 0 && (avgDuration.trend > 0 ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />)}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
