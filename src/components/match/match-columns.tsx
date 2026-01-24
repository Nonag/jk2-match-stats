"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { formatDate, formatDuration } from "@/lib/utils";
import type { MatchSummary } from "@/lib/db/match";
import { SortableHeader } from "./sortable-header";

export const matchColumns: ColumnDef<MatchSummary>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => <SortableHeader column={column} label="Date" />,
    cell: ({ row }) => formatDate(row.getValue("date")),
  },
  {
    accessorKey: "mapName",
    header: ({ column }) => <SortableHeader column={column} label="Map" />,
    cell: ({ row }) => row.getValue("mapName"),
    filterFn: (row, id, value) => {
      const mapName = (row.getValue(id) as string).toLowerCase();
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
            className={
              redScore > blueScore
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-500/30"
            }
            variant={redScore > blueScore ? "default" : "secondary"}
          >
            {redScore}
          </Badge>
          <span className="text-muted-foreground">-</span>
          <Badge
            className={
              blueScore > redScore
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-blue-500/30"
            }
            variant={blueScore > redScore ? "default" : "secondary"}
          >
            {blueScore}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => <SortableHeader column={column} label="Duration" />,
    // duration is stored in minutes, convert to milliseconds for formatDuration
    cell: ({ row }) => formatDuration((row.getValue("duration") as number) * 60000),
  },
];
