"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { MatchPlayerDetail } from "@/lib/db/match";

export const matchPlayersColumns: ColumnDef<MatchPlayerDetail>[] = [
  // Fixed columns - enableHiding: false
  {
    accessorKey: "nameClean",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Player
          <ArrowUpDown />
        </Button>
      );
    },
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
    accessorKey: "score",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
        >
          Score
          <ArrowUpDown />
        </Button>
      );
    },
    enableHiding: false,
    cell: ({ row }) => {
      const value = row.getValue("score") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },
  {
    accessorKey: "captures",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
        >
          Caps
          <ArrowUpDown />
        </Button>
      );
    },
    enableHiding: false,
    cell: ({ row }) => {
      const value = row.getValue("captures") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },
  {
    accessorKey: "returns",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ret
          <ArrowUpDown />
        </Button>
      );
    },
    enableHiding: false,
    cell: ({ row }) => {
      const value = row.getValue("returns") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },
  {
    accessorKey: "baseCleanKills",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          BC
          <ArrowUpDown />
        </Button>
      );
    },
    enableHiding: false,
    cell: ({ row }) => {
      const value = row.getValue("baseCleanKills") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },

  // Optional columns - default shown
  {
    accessorKey: "flagHold",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          FH
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const milliseconds = row.getValue("flagHold") as number;
      const formatted = new Date(milliseconds).toISOString().slice(11, 19);
      return <div className={milliseconds === 0 ? "text-muted-foreground" : ""}>{formatted}</div>;
    },
  },
  {
    accessorKey: "flagGrabs",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          FG
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("flagGrabs") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },
  {
    id: "kdr",
    accessorFn: (row) => {
      return row.deaths > 0 ? row.kills / row.deaths : row.kills;
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          K/D/R
          <ArrowUpDown />
        </Button>
      );
    },
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          #
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span>
        {row.getValue("clientNumber")}
      </span>
    ),
  },
  {
    accessorKey: "assists",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ast
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("assists") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },
  {
    accessorKey: "time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("time") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}m</div>;
    },
  },
  {
    accessorKey: "ping",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ping
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("ping") as number;
      return <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>;
    },
  },
];
