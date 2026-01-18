"use client";

import { Badge } from "@/components/ui/badge";
import type { MatchDetail } from "@/lib/db/match";

interface MatchDetailHeaderProps {
  match: MatchDetail;
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function MatchDetailHeader({ match }: MatchDetailHeaderProps) {
  const redWins = match.redScore > match.blueScore;
  const blueWins = match.blueScore > match.redScore;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-3xl font-bold ${
              redWins ? "text-red-500" : "text-red-300 dark:text-red-800"
            }`}
          >
            {match.redScore}
          </span>
          <span className="text-3xl font-bold text-muted-foreground">
            :
          </span>
          <span
            className={`text-3xl font-bold ${
              blueWins ? "text-blue-500" : "text-blue-300 dark:text-blue-800"
            }`}
          >
            {match.blueScore}
          </span>
        </div>
        <Badge variant="outline">{formatDuration(match.duration)}</Badge>
        <span className="font-medium">{match.serverName}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{match.mapName}</span>
        <span>•</span>
        <span>{formatDate(match.date)}</span>
      </div>
    </div>
  );
}
