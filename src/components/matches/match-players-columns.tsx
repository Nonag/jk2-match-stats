"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { MatchPlayerDetail } from "@/lib/api/matches";

export const matchPlayersColumns: ColumnDef<MatchPlayerDetail>[] = [
  {
    accessorKey: "clientNumber",
    header: "#",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("clientNumber")}</span>
    ),
  },
  {
    accessorKey: "nameClean",
    header: "Player",
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
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Score
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right">{row.getValue("score")}</div>,
  },
  {
    accessorKey: "captures",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Caps
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-semibold">{row.getValue("captures")}</div>
    ),
  },
  {
    accessorKey: "returns",
    header: "Ret",
    cell: ({ row }) => <div className="text-right">{row.getValue("returns")}</div>,
  },
  {
    accessorKey: "baseCaptures",
    header: "BC",
    cell: ({ row }) => <div className="text-right">{row.getValue("baseCaptures")}</div>,
  },
  {
    accessorKey: "assists",
    header: "Ast",
    cell: ({ row }) => <div className="text-right">{row.getValue("assists")}</div>,
  },
  {
    accessorKey: "kills",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        K
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right">{row.getValue("kills")}</div>,
  },
  {
    accessorKey: "deaths",
    header: "D",
    cell: ({ row }) => <div className="text-right">{row.getValue("deaths")}</div>,
  },
  {
    id: "kd",
    header: "K/D",
    cell: ({ row }) => {
      const kills = row.original.kills;
      const deaths = row.original.deaths;
      const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
      return <div className="text-right">{kd}</div>;
    },
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => <div className="text-right">{row.getValue("time")}m</div>,
  },
  {
    accessorKey: "ping",
    header: "Ping",
    cell: ({ row }) => <div className="text-right">{row.getValue("ping")}</div>,
  },
];
