"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { PlayerWithAliases } from "@/lib/db/player";

export const playerColumns: ColumnDef<PlayerWithAliases>[] = [
  {
    accessorKey: "primaryName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Primary Name
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("primaryName")}</span>
    ),
  },
  {
    accessorKey: "aliases",
    header: "Aliases",
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
  },
  {
    accessorKey: "matchCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Matches
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("matchCount")}</div>
    ),
  },
];
