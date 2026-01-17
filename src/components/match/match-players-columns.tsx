"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { MatchPlayerDetail } from "@/lib/db/match";

export const matchPlayersColumns: ColumnDef<MatchPlayerDetail>[] = [
  {
    accessorKey: "clientNumber",
    header: "#",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("clientNumber")}
      </span>
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
    cell: ({ row }) => <div>{row.getValue("score")}</div>,
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
    cell: ({ row }) => (
      <div>{row.getValue("captures")}</div>
    ),
  },
  {
    accessorKey: "returns",
    header: "Ret",
    cell: ({ row }) => <div>{row.getValue("returns")}</div>,
  },
  {
    accessorKey: "baseCaptures",
    header: "BC",
    cell: ({ row }) => <div>{row.getValue("baseCaptures")}</div>,
  },
  {
    accessorKey: "assists",
    header: "Ast",
    cell: ({ row }) => <div>{row.getValue("assists")}</div>,
  },
  {
    accessorKey: "kills",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          K
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("kills")}</div>,
  },
  {
    accessorKey: "deaths",
    header: "D",
    cell: ({ row }) => <div>{row.getValue("deaths")}</div>,
  },
  {
    id: "kd",
    header: "K/D",
    cell: ({ row }) => {
      const deaths = row.original.deaths;
      const kills = row.original.kills;
      const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
      return <div>{kd}</div>;
    },
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => <div>{row.getValue("time")}m</div>,
  },
  {
    accessorKey: "ping",
    header: "Ping",
    cell: ({ row }) => <div>{row.getValue("ping")}</div>,
  },
];
