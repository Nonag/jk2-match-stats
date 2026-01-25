"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { SortableHeader } from "@/components/match/sortable-header";
import { formatDate } from "@/lib/utils";
import type { PlayerListItem, PlayerWithAliases } from "@/lib/db/player";

export const playerListColumns: ColumnDef<PlayerListItem>[] = [
  {
    accessorKey: "type",
    cell: ({ row }) => {
      const isMatchPlayer = row.original.type === "matchplayer";
      return isMatchPlayer ? (
        <Badge
          className="border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
          variant="outline"
        >
          Unassigned
        </Badge>
      ) : (
        <Badge
          className="border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
          variant="outline"
        >
          Player
        </Badge>
      );
    },
    enableSorting: false,
    header: "Status",
  },
  {
    accessorKey: "primaryName",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("primaryName")}</span>
    ),
    header: ({ column }) => (
      <SortableHeader column={column} label="Name" shortLabel="Name" />
    ),
  },
  {
    accessorKey: "matchCount",
    cell: ({ row }) => (
      <div className="tabular-nums">{row.getValue("matchCount")}</div>
    ),
    header: ({ column }) => (
      <SortableHeader column={column} label="Matches" shortLabel="M" />
    ),
  },
  {
    accessorKey: "capturesSum",
    cell: ({ row }) => {
      const value = row.getValue("capturesSum") as number;
      return (
        <div className={value === 0 ? "text-muted-foreground tabular-nums" : "tabular-nums"}>
          {value}
        </div>
      );
    },
    header: ({ column }) => (
      <SortableHeader column={column} label="Captures" shortLabel="C" />
    ),
  },
  {
    accessorKey: "returnsSum",
    cell: ({ row }) => {
      const value = row.getValue("returnsSum") as number;
      return (
        <div className={value === 0 ? "text-muted-foreground tabular-nums" : "tabular-nums"}>
          {value}
        </div>
      );
    },
    header: ({ column }) => (
      <SortableHeader column={column} label="Returns" shortLabel="R" />
    ),
  },
  {
    accessorKey: "bcSum",
    cell: ({ row }) => {
      const value = row.getValue("bcSum") as number;
      return (
        <div className={value === 0 ? "text-muted-foreground tabular-nums" : "tabular-nums"}>
          {value}
        </div>
      );
    },
    header: ({ column }) => (
      <SortableHeader column={column} label="Base Clean Kills" shortLabel="BC" />
    ),
  },
  {
    accessorKey: "lastMatchDate",
    cell: ({ row }) => {
      const date = row.getValue("lastMatchDate") as Date | null;
      return date ? (
        <span className="text-muted-foreground">{formatDate(date)}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
    header: ({ column }) => (
      <SortableHeader column={column} label="Last Match" shortLabel="Last" />
    ),
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.lastMatchDate?.getTime() ?? 0;
      const b = rowB.original.lastMatchDate?.getTime() ?? 0;
      return a - b;
    },
  },
];

// Legacy columns for PlayerWithAliases (keep for backwards compatibility)
export const playerColumns: ColumnDef<PlayerWithAliases>[] = [
  {
    accessorKey: "primaryName",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("primaryName")}</span>
    ),
    header: ({ column }) => (
      <SortableHeader column={column} label="Primary Name" />
    ),
  },
  {
    accessorKey: "aliases",
    cell: ({ row }) => {
      const aliases = row.original.aliases;
      return (
        <div className="flex flex-wrap gap-1">
          {aliases.length === 0 ? (
            <span className="text-muted-foreground text-sm">No aliases</span>
          ) : (
            aliases.map((alias) => (
              <Badge key={alias.id} variant="secondary">
                {alias.nameClean}
              </Badge>
            ))
          )}
        </div>
      );
    },
    header: "Aliases",
  },
  {
    accessorKey: "matchCount",
    cell: ({ row }) => (
      <div className="tabular-nums text-right">{row.getValue("matchCount")}</div>
    ),
    header: ({ column }) => (
      <SortableHeader column={column} label="Matches" />
    ),
  },
];
