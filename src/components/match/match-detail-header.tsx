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
  const isDraw = match.redScore === match.blueScore;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge
            className={`text-lg px-3 py-1 ${
              redWins ? "bg-red-500 hover:bg-red-600" : "bg-red-500/40"
            }`}
          >
            {match.redScore}
          </Badge>
          <span className="text-muted-foreground font-medium">
            {isDraw ? "=" : "vs"}
          </span>
          <Badge
            className={`text-lg px-3 py-1 ${
              blueWins ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-500/40"
            }`}
          >
            {match.blueScore}
          </Badge>
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
