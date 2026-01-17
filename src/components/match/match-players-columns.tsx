"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { MatchPlayerDetail } from "@/lib/db/match";

interface SortableHeaderProps {
  column: Column<MatchPlayerDetail, unknown>;
  label: string;
}

function SortableHeader({ column, label }: SortableHeaderProps) {
  const sorted = column.getIsSorted();

  const handleClick = (e: React.MouseEvent) => {
    if (sorted === "asc") {
      // Third click: remove from sort
      column.clearSorting();
    } else if (sorted === "desc") {
      // Second click: change to asc
      column.toggleSorting(false, e.shiftKey);
    } else {
      // First click: sort desc
      column.toggleSorting(true, e.shiftKey);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span>{label}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleClick}
      >
        {sorted === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : sorted === "desc" ? (
          <ArrowDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

export const matchPlayersColumns: ColumnDef<MatchPlayerDetail>[] = [
  // Fixed columns - enableHiding: false
  {
    accessorKey: "team",
    header: ({ column }) => <SortableHeader column={column} label="Team" />,
    enableHiding: false,
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      // Custom sort: Red first, then Blue
      const teamOrder = { Red: 0, Blue: 1, Spectator: 2 };
      const teamA = rowA.getValue("team") as string;
      const teamB = rowB.getValue("team") as string;
      return (teamOrder[teamA as keyof typeof teamOrder] ?? 3) - (teamOrder[teamB as keyof typeof teamOrder] ?? 3);
    },
    cell: ({ row }) => {
      const team = row.getValue("team") as string;
      return <span className="sr-only">{team}</span>;
    },
  },
  {
    accessorKey: "nameClean",
    header: ({ column }) => <SortableHeader column={column} label="Player" />,
    enableHiding: false,
    cell: ({ row }) => {
      const nameClean = row.getValue("nameClean") as string;
      const playerPrimaryName = row.original.playerPrimaryName;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{nameClean}</span>
          {playerPrimaryName && playerPrimaryName !== nameClean && (
            <span className="text-xs text-muted-foreground">
              aka {playerPrimaryName}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "scoreSum",
    header: ({ column }) => <SortableHeader column={column} label="Score" />,
    enableHiding: false,
    cell: ({ row }) => {
      const value = row.getValue("scoreSum") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },
  {
    accessorKey: "capturesSum",
    header: ({ column }) => <SortableHeader column={column} label="Caps" />,
    enableHiding: false,
    cell: ({ row }) => {
      const value = row.getValue("capturesSum") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },
  {
    accessorKey: "returnsSum",
    header: ({ column }) => <SortableHeader column={column} label="Ret" />,
    enableHiding: false,
    cell: ({ row }) => {
      const value = row.getValue("returnsSum") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },
  {
    accessorKey: "bcSum",
    header: ({ column }) => <SortableHeader column={column} label="BC" />,
    enableHiding: false,
    cell: ({ row }) => {
      const value = row.getValue("bcSum") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },

  // Optional columns - default shown
  {
    accessorKey: "flagHoldSum",
    header: ({ column }) => <SortableHeader column={column} label="FH" />,
    cell: ({ row }) => {
      const milliseconds = row.getValue("flagHoldSum") as number;
      const formatted = new Date(milliseconds).toISOString().slice(11, 19);
      return <div className={milliseconds === 0 ? "text-muted-foreground" : ""}>{formatted}</div>;
    },
  },
  {
    accessorKey: "flagGrabsSum",
    header: ({ column }) => <SortableHeader column={column} label="FG" />,
    cell: ({ row }) => {
      const value = row.getValue("flagGrabsSum") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },
  {
    id: "kdr",
    accessorFn: (row) => {
      return row.deaths > 0 ? row.kills / row.deaths : row.kills;
    },
    header: ({ column }) => <SortableHeader column={column} label="K/D/R" />,
    cell: ({ row }) => {
      const deaths = row.original.deaths;
      const kills = row.original.kills;
      const ratio = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
      const none = kills === 0 && deaths === 0;
      return (
        <span className={none ? "text-muted-foreground" : ""}>
          <span>{kills}/{deaths}</span>
          <span className="text-muted-foreground ml-1">({ratio})</span>
        </span>
      );
    },
  },

  // Optional columns - default hidden
  {
    accessorKey: "clientNumber",
    header: ({ column }) => <SortableHeader column={column} label="#" />,
    cell: ({ row }) => (
      <span>
        {row.getValue("clientNumber")}
      </span>
    ),
  },
  {
    accessorKey: "assistsSum",
    header: ({ column }) => <SortableHeader column={column} label="Ast" />,
    cell: ({ row }) => {
      const value = row.getValue("assistsSum") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },
  {
    accessorKey: "timeSum",
    header: ({ column }) => <SortableHeader column={column} label="Time" />,
    cell: ({ row }) => {
      const value = row.getValue("timeSum") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}m</div>;
    },
  },
  {
    accessorKey: "pingMean",
    header: ({ column }) => <SortableHeader column={column} label="Ping" />,
    cell: ({ row }) => {
      const value = row.getValue("pingMean") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },
];
