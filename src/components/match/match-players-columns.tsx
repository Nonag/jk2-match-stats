"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { MatchPlayerDetail } from "@/lib/db/match";
import { formatDuration } from "@/lib/utils";
import { useTableSettings } from "@/providers";
import { columnConfig, ColumnId } from "./match-players-config";

interface SortableHeaderProps {
  column: Column<MatchPlayerDetail, unknown>;
}

function SortableHeader({ column }: SortableHeaderProps) {
  const cfg = columnConfig[column.id as ColumnId];
  const { settings } = useTableSettings();
  const { shortLabel, label } = cfg;
  const lockTeamSort = settings.lockTeamSort;
  const sorted = column.getIsSorted();
  const sortIndex = column.getSortIndex();
  const sortPriority = sortIndex >= 0 ? (lockTeamSort ? sortIndex : sortIndex + 1) : -1;

  const handleClick = (event: React.MouseEvent) => {
    if (sorted === "asc") {
      column.clearSorting();
    } else if (sorted === "desc") {
      column.toggleSorting(false, event.shiftKey);
    } else {
      column.toggleSorting(true, event.shiftKey);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1">
          <span className="relative">
            {shortLabel}
            {sortPriority >= 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -left-4 min-w-4 h-4 px-1 text-[10px]"
              >
                {sortPriority}
              </Badge>
            )}
          </span>
          <Button variant="link" size="icon-sm" onClick={handleClick}>
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

// Combined cell renderer - displays as kills/returns/attempts
interface CombinedCellProps {
  attempts?: number;
  kills: number;
  returns: number;
}

function CombinedCell({ attempts, kills, returns }: CombinedCellProps) {
  const isEmpty = kills === 0 && returns === 0 && (attempts === undefined || attempts === 0);
  return (
    <div className={isEmpty ? "text-muted-foreground" : ""}>
      {kills}/{returns}/{attempts ?? "-"}
    </div>
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
      return (
        <div className={milliseconds === 0 ? "text-muted-foreground" : ""}>
          {formatDuration(milliseconds)}
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

  // Combined columns - display as kills/returns/attempts, sort by kills
  [ColumnId.blubsCombined]: {
    id: ColumnId.blubsCombined,
    accessorFn: (row) => row.blubsKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.blubsCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.blubsKills} returns={row.original.blubsReturns} attempts={row.original.blubsAttempts} />,
  },
  [ColumnId.bluCombined]: {
    id: ColumnId.bluCombined,
    accessorFn: (row) => row.bluKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.bluCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.bluKills} returns={row.original.bluReturns} />,
  },
  [ColumnId.bsCombined]: {
    id: ColumnId.bsCombined,
    accessorFn: (row) => row.bsKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.bsCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.bsKills} returns={row.original.bsReturns} attempts={row.original.bsAttempts} />,
  },
  [ColumnId.dbsCombined]: {
    id: ColumnId.dbsCombined,
    accessorFn: (row) => row.dbsKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.dbsCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.dbsKills} returns={row.original.dbsReturns} attempts={row.original.dbsAttempts} />,
  },
  [ColumnId.dfaCombined]: {
    id: ColumnId.dfaCombined,
    accessorFn: (row) => row.dfaKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.dfaCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.dfaKills} returns={row.original.dfaReturns} attempts={row.original.dfaAttempts} />,
  },
  [ColumnId.doomCombined]: {
    id: ColumnId.doomCombined,
    accessorFn: (row) => row.doomKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.doomCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.doomKills} returns={row.original.doomReturns} />,
  },
  [ColumnId.idleCombined]: {
    id: ColumnId.idleCombined,
    accessorFn: (row) => row.idleKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.idleCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.idleKills} returns={row.original.idleReturns} />,
  },
  [ColumnId.mineCombined]: {
    id: ColumnId.mineCombined,
    accessorFn: (row) => row.mineKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.mineCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.mineKills} returns={row.original.mineReturns} />,
  },
  [ColumnId.redCombined]: {
    id: ColumnId.redCombined,
    accessorFn: (row) => row.redKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.redCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.redKills} returns={row.original.redReturns} />,
  },
  [ColumnId.turCombined]: {
    id: ColumnId.turCombined,
    accessorFn: (row) => row.turKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.turCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.turKills} returns={row.original.turReturns} />,
  },
  [ColumnId.unknCombined]: {
    id: ColumnId.unknCombined,
    accessorFn: (row) => row.unknKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.unknCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.unknKills} returns={row.original.unknReturns} />,
  },
  [ColumnId.upcutCombined]: {
    id: ColumnId.upcutCombined,
    accessorFn: (row) => row.upcutKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.upcutCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.upcutKills} returns={row.original.upcutReturns} />,
  },
  [ColumnId.ydfaCombined]: {
    id: ColumnId.ydfaCombined,
    accessorFn: (row) => row.ydfaKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.ydfaCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.ydfaKills} returns={row.original.ydfaReturns} attempts={row.original.ydfaAttempts} />,
  },
  [ColumnId.yelCombined]: {
    id: ColumnId.yelCombined,
    accessorFn: (row) => row.yelKills,
    header: ({ column }) => <SortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.yelCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.yelKills} returns={row.original.yelReturns} />,
  },
};

// Generate columns in the order defined in columnConfig
export const matchPlayersColumns: ColumnDef<MatchPlayerDetail>[] = (
  Object.keys(columnConfig) as ColumnId[]
).map((id) => customColumns[id] ?? createNumericColumn(id));
