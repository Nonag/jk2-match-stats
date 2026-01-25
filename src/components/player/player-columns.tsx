"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { BadgeCheck } from "lucide-react";

import { SortableHeader } from "@/components/match/sortable-header";
import { columnConfig, ColumnId } from "@/components/match/match-players-config";
import { formatDate, formatDuration } from "@/lib/utils";
import { useTableSettings } from "@/providers";
import type { PlayerListItem } from "@/lib/db/player";

// Player-specific column IDs (not in match-players-config)
export enum PlayerColumnId {
  matchCount = "matchCount",
  matchDate = "matchDate",
}

interface PlayerSortableHeaderProps {
  column: Column<PlayerListItem, unknown>;
}

function PlayerSortableHeader({ column }: PlayerSortableHeaderProps) {
  const cfg = columnConfig[column.id as ColumnId];
  const { settings } = useTableSettings();
  const lockTeamSort = settings.lockTeamSort;
  const sortIndex = column.getSortIndex();
  const sortPriority = sortIndex >= 0 ? (lockTeamSort ? sortIndex : sortIndex + 1) : undefined;

  return (
    <SortableHeader
      column={column}
      enableMultiSort
      label={cfg.label}
      shortLabel={cfg.shortLabel}
      sortPriority={sortPriority}
    />
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
function createNumericColumn(id: ColumnId): ColumnDef<PlayerListItem> {
  return {
    accessorKey: id,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[id].canHide,
    cell: ({ row }) => <NumericCell value={row.getValue(id) as number} />,
  };
}

// Player-specific columns (matchCount, matchDate)
const playerSpecificColumns: ColumnDef<PlayerListItem>[] = [
  {
    accessorKey: PlayerColumnId.matchCount,
    header: ({ column }) => (
      <SortableHeader column={column} label="Matches" shortLabel="M" />
    ),
    enableHiding: true,
    cell: ({ row }) => (
      <div className="tabular-nums">{row.getValue(PlayerColumnId.matchCount)}</div>
    ),
  },
  {
    accessorKey: PlayerColumnId.matchDate,
    header: ({ column }) => (
      <SortableHeader column={column} label="Match Date" shortLabel="Date" />
    ),
    enableHiding: true,
    cell: ({ row }) => {
      const matchDate = row.original.matchDate;
      const matchDateLatest = row.original.matchDateLatest;
      const date = matchDate ?? matchDateLatest;
      const isLast = !matchDate && matchDateLatest;
      return date ? (
        <span className="text-muted-foreground whitespace-nowrap">
          {isLast && <span className="text-xs mr-1">Last:</span>}
          {formatDate(date)}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = (rowA.original.matchDate ?? rowA.original.matchDateLatest)?.getTime() ?? 0;
      const b = (rowB.original.matchDate ?? rowB.original.matchDateLatest)?.getTime() ?? 0;
      return a - b;
    },
  },
];

// Custom column definitions for columns that need special handling (adapted from match-players-columns)
const customColumns: Partial<Record<ColumnId, ColumnDef<PlayerListItem>>> = {
  [ColumnId.team]: {
    accessorKey: ColumnId.team,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.team].canHide,
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const teamOrder = { Red: 0, Blue: 1, Spectator: 2, "": 3 };
      const teamA = rowA.getValue(ColumnId.team) as string;
      const teamB = rowB.getValue(ColumnId.team) as string;
      return (
        (teamOrder[teamA as keyof typeof teamOrder] ?? 3) -
        (teamOrder[teamB as keyof typeof teamOrder] ?? 3)
      );
    },
    cell: ({ row }) => {
      const team = row.getValue(ColumnId.team) as string;
      if (!team) return null;
      return <span className="sr-only">{team}</span>;
    },
  },

  [ColumnId.nameClean]: {
    accessorKey: ColumnId.nameClean,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.nameClean].canHide,
    cell: ({ row, table }) => {
      const nameClean = row.getValue(ColumnId.nameClean) as string;
      const playerAlias = row.original.playerAlias;
      const isPlayer = row.original.type === "player";
      const onNameClick = (table.options.meta as { onNameClick?: (item: PlayerListItem) => void })?.onNameClick;
      return (
        <button
          type="button"
          className="flex flex-col text-left hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onNameClick?.(row.original);
          }}
        >
          <div className="flex items-center gap-1">
            <span className="font-medium">{nameClean}</span>
            {isPlayer && (
              <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-500/20" />
            )}
          </div>
          {!isPlayer && playerAlias && playerAlias !== nameClean && (
            <span className="text-xs text-muted-foreground">
              aka {playerAlias}
            </span>
          )}
        </button>
      );
    },
  },

  [ColumnId.flagHoldSum]: {
    accessorKey: ColumnId.flagHoldSum,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
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
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.kdr].canHide,
    cell: ({ row }) => {
      const kills = row.original.kills ?? 0;
      const deaths = row.original.deaths ?? 0;
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
    header: ({ column }) => <PlayerSortableHeader column={column} />,
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
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.blubsCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.blubsKills} returns={row.original.blubsReturns} attempts={row.original.blubsAttempts} />,
  },
  [ColumnId.bluCombined]: {
    id: ColumnId.bluCombined,
    accessorFn: (row) => row.bluKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.bluCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.bluKills} returns={row.original.bluReturns} />,
  },
  [ColumnId.bsCombined]: {
    id: ColumnId.bsCombined,
    accessorFn: (row) => row.bsKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.bsCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.bsKills} returns={row.original.bsReturns} attempts={row.original.bsAttempts} />,
  },
  [ColumnId.dbsCombined]: {
    id: ColumnId.dbsCombined,
    accessorFn: (row) => row.dbsKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.dbsCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.dbsKills} returns={row.original.dbsReturns} attempts={row.original.dbsAttempts} />,
  },
  [ColumnId.dfaCombined]: {
    id: ColumnId.dfaCombined,
    accessorFn: (row) => row.dfaKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.dfaCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.dfaKills} returns={row.original.dfaReturns} attempts={row.original.dfaAttempts} />,
  },
  [ColumnId.doomCombined]: {
    id: ColumnId.doomCombined,
    accessorFn: (row) => row.doomKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.doomCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.doomKills} returns={row.original.doomReturns} />,
  },
  [ColumnId.idleCombined]: {
    id: ColumnId.idleCombined,
    accessorFn: (row) => row.idleKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.idleCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.idleKills} returns={row.original.idleReturns} />,
  },
  [ColumnId.mineCombined]: {
    id: ColumnId.mineCombined,
    accessorFn: (row) => row.mineKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.mineCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.mineKills} returns={row.original.mineReturns} />,
  },
  [ColumnId.redCombined]: {
    id: ColumnId.redCombined,
    accessorFn: (row) => row.redKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.redCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.redKills} returns={row.original.redReturns} />,
  },
  [ColumnId.turCombined]: {
    id: ColumnId.turCombined,
    accessorFn: (row) => row.turKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.turCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.turKills} returns={row.original.turReturns} />,
  },
  [ColumnId.unknCombined]: {
    id: ColumnId.unknCombined,
    accessorFn: (row) => row.unknKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.unknCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.unknKills} returns={row.original.unknReturns} />,
  },
  [ColumnId.upcutCombined]: {
    id: ColumnId.upcutCombined,
    accessorFn: (row) => row.upcutKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.upcutCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.upcutKills} returns={row.original.upcutReturns} />,
  },
  [ColumnId.ydfaCombined]: {
    id: ColumnId.ydfaCombined,
    accessorFn: (row) => row.ydfaKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.ydfaCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.ydfaKills} returns={row.original.ydfaReturns} attempts={row.original.ydfaAttempts} />,
  },
  [ColumnId.yelCombined]: {
    id: ColumnId.yelCombined,
    accessorFn: (row) => row.yelKills,
    header: ({ column }) => <PlayerSortableHeader column={column} />,
    enableHiding: columnConfig[ColumnId.yelCombined].canHide,
    cell: ({ row }) => <CombinedCell kills={row.original.yelKills} returns={row.original.yelReturns} />,
  },
};

// Generate columns from match-players-config, reusing the same structure
const matchPlayersBasedColumns: ColumnDef<PlayerListItem>[] = (
  Object.keys(columnConfig) as ColumnId[]
).map((id) => customColumns[id] ?? createNumericColumn(id));

// Final column order: nameClean first (sticky), then player-specific, then rest of match-player columns
export const playerListColumns: ColumnDef<PlayerListItem>[] = [
  matchPlayersBasedColumns[0], // team (hidden but needed for row coloring)
  matchPlayersBasedColumns[1], // nameClean (sticky)
  playerSpecificColumns[0], // matchCount
  playerSpecificColumns[1], // matchDate
  ...matchPlayersBasedColumns.slice(2), // rest of match-player columns
];
