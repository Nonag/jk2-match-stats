"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { MatchSummary } from "@/lib/api/matches";

interface MatchesTableProps {
  matches: MatchSummary[];
  loading?: boolean;
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function formatMapName(mapName: string) {
  return mapName
    .replace(/^ctf_/, "")
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function MatchesTable({ matches, loading }: MatchesTableProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading matches...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">
          No matches found. Import a CSV file to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Map</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow
              key={match.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/matches/${match.id}`)}
            >
              <TableCell className="font-medium">
                {formatDate(match.date)}
              </TableCell>
              <TableCell>{formatMapName(match.mapName)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={match.redScore > match.blueScore ? "default" : "secondary"}
                    className={
                      match.redScore > match.blueScore
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-red-500/30"
                    }
                  >
                    {match.redScore}
                  </Badge>
                  <span className="text-muted-foreground">-</span>
                  <Badge
                    variant={match.blueScore > match.redScore ? "default" : "secondary"}
                    className={
                      match.blueScore > match.redScore
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-blue-500/30"
                    }
                  >
                    {match.blueScore}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{formatDuration(match.duration)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
