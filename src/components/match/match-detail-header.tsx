"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate, formatDuration } from "@/lib/utils";
import type { MatchDetail } from "@/lib/db/match";

interface MatchDetailHeaderProps {
  match: MatchDetail;
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
        <Badge variant="outline">{formatDuration(match.duration * 60000)}</Badge>
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
