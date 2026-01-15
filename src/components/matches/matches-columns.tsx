"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { MatchSummary } from "@/lib/api/matches";

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

export const matchesColumns: ColumnDef<MatchSummary>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue("date")),
  },
  {
    accessorKey: "mapName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Map
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatMapName(row.getValue("mapName")),
    filterFn: (row, id, value) => {
      const mapName = formatMapName(row.getValue(id) as string).toLowerCase();
      return mapName.includes(value.toLowerCase());
    },
  },
  {
    id: "result",
    header: "Result",
    cell: ({ row }) => {
      const redScore = row.original.redScore;
      const blueScore = row.original.blueScore;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={redScore > blueScore ? "default" : "secondary"}
            className={
              redScore > blueScore
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-500/30"
            }
          >
            {redScore}
          </Badge>
          <span className="text-muted-foreground">-</span>
          <Badge
            variant={blueScore > redScore ? "default" : "secondary"}
            className={
              blueScore > redScore
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-blue-500/30"
            }
          >
            {blueScore}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Duration
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDuration(row.getValue("duration")),
  },
];
