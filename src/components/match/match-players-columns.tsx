"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { MatchPlayerDetail } from "@/lib/db/match";
import { columnConfig, ColumnId } from "./match-players-config";

interface SortableHeaderProps {
  column: Column<MatchPlayerDetail, unknown>;
}

function SortableHeader({ column }: SortableHeaderProps) {
  const cfg = columnConfig[column.id as ColumnId];
  const { shortLabel, label } = cfg;
  const sorted = column.getIsSorted();

  const handleClick = (e: React.MouseEvent) => {
    if (sorted === "asc") {
      column.clearSorting();
    } else if (sorted === "desc") {
      column.toggleSorting(false, e.shiftKey);
    } else {
      column.toggleSorting(true, e.shiftKey);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1">
          <span>{shortLabel}</span>
          <Button variant="ghost" size="icon" onClick={handleClick}>
            {sorted === "asc" ? (
              <ArrowUp />
            ) : sorted === "desc" ? (
              <ArrowDown />
            ) : (
              <ArrowUpDown className="text-muted-foreground" />
            )}
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// Default numeric cell renderer - shows value with muted style when 0
function NumericCell({ value }: { value: number }) {
  return (
    <div className={value === 0 ? "text-muted-foreground" : ""}>{value}</div>
  );
}

// Generate a standard column definition for numeric fields
function createNumericColumn(id: ColumnId): ColumnDef<MatchPlayerDetail> {
  return {
    accessorKey: id,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[id].canHide,
    cell: ({ row }) => <NumericCell value={row.getValue(id) as number} />,
  };
}

// Custom column definitions for columns that need special handling
const customColumns: Partial<Record<ColumnId, ColumnDef<MatchPlayerDetail>>> = {
  [ColumnId.team]: {
    accessorKey: ColumnId.team,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.team].canHide,
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const teamOrder = { Red: 0, Blue: 1, Spectator: 2 };
      const teamA = rowA.getValue(ColumnId.team) as string;
      const teamB = rowB.getValue(ColumnId.team) as string;
      return (
        (teamOrder[teamA as keyof typeof teamOrder] ?? 3) -
        (teamOrder[teamB as keyof typeof teamOrder] ?? 3)
      );
    },
    cell: ({ row }) => {
      const team = row.getValue(ColumnId.team) as string;
      return <span className="sr-only">{team}</span>;
    },
  },

  [ColumnId.nameClean]: {
    accessorKey: ColumnId.nameClean,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.nameClean].canHide,
    cell: ({ row }) => {
      const nameClean = row.getValue(ColumnId.nameClean) as string;
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

  [ColumnId.flagHoldSum]: {
    accessorKey: ColumnId.flagHoldSum,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.flagHoldSum].canHide,
    cell: ({ row }) => {
      const milliseconds = row.getValue(ColumnId.flagHoldSum) as number;
      const formatted = new Date(milliseconds).toISOString().slice(11, 19);
      return (
        <div className={milliseconds === 0 ? "text-muted-foreground" : ""}>
          {formatted}
        </div>
      );
    },
  },

  [ColumnId.kdr]: {
    id: ColumnId.kdr,
    accessorFn: (row) => (row.deaths > 0 ? row.kills / row.deaths : row.kills),
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.kdr].canHide,
    cell: ({ row }) => {
      const { deaths, kills } = row.original;
      const ratio = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
      const none = kills === 0 && deaths === 0;
      return (
        <span className={none ? "text-muted-foreground" : ""}>
          <span>
            {kills}/{deaths}
          </span>
          <span className="text-muted-foreground ml-1">({ratio})</span>
        </span>
      );
    },
  },

  [ColumnId.timeSum]: {
    accessorKey: ColumnId.timeSum,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.timeSum].canHide,
    cell: ({ row }) => {
      const value = row.getValue(ColumnId.timeSum) as number;
      return (
        <div className={value === 0 ? "text-muted-foreground" : ""}>
          {value}m
        </div>
      );
    },
  },
};

// Generate columns in the order defined in columnConfig
export const matchPlayersColumns: ColumnDef<MatchPlayerDetail>[] = (
  Object.keys(columnConfig) as ColumnId[]
).map((id) => customColumns[id] ?? createNumericColumn(id));
