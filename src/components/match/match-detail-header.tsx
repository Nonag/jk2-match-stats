"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {match.mapName}
          </CardTitle>
          <Badge variant="outline">{formatDuration(match.duration)}</Badge>
        </div>
        <p className="text-muted-foreground">{formatDate(match.date)}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-8 py-4">
          <div className="text-center">
            <Badge
              className={`text-3xl px-6 py-2 ${
                redWins
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-red-500/40"
              }`}
            >
              {match.redScore}
            </Badge>
            <p className={`mt-2 font-medium ${redWins ? "text-red-500" : "text-muted-foreground"}`}>
              Red Team
            </p>
          </div>
          <div className="text-4xl font-bold text-muted-foreground">
            {isDraw ? "=" : "vs"}
          </div>
          <div className="text-center">
            <Badge
              className={`text-3xl px-6 py-2 ${
                blueWins
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-blue-500/40"
              }`}
            >
              {match.blueScore}
            </Badge>
            <p className={`mt-2 font-medium ${blueWins ? "text-blue-500" : "text-muted-foreground"}`}>
              Blue Team
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Server: {match.serverIp}</span>
          <span>•</span>
          <span>{match.serverName}</span>
        </div>
      </CardContent>
    </Card>
  );
}
