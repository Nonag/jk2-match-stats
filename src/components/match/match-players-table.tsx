"use client";

import { useMemo, useState } from "react";
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Lock,
  LockOpen,
  Settings2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { TablePagination } from "@/components/common/table-pagination";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTableSettings } from "@/providers";
import { matchPlayersColumns } from "./match-players-columns";
import {
  columnGroups,
  columnLabels,
  type ColumnGroupItem,
  type ColumnId,
} from "./match-players-config";
import type { MatchPlayerDetail } from "@/lib/db/match";

interface MatchPlayersTableProps {
  minimal?: boolean;
  players: MatchPlayerDetail[];
  team?: "Red" | "Blue" | "Spectator";
}

function getTeamStyles(team: "Red" | "Blue" | "Spectator") {
  if (team === "Red") {
    return {
      badge: "bg-red-500 hover:bg-red-600",
    };
  }
  if (team === "Blue") {
    return {
      badge: "bg-blue-500 hover:bg-blue-600",
    };
  }
  return {
    badge: "bg-muted text-muted-foreground",
  };
}

interface ColumnGroupSectionProps {
  depth?: number;
  group: ColumnGroupItem;
  table: ReturnType<typeof useReactTable<MatchPlayerDetail>>;
}

function ColumnGroupSection({ depth = 0, group, table }: ColumnGroupSectionProps) {
  // Get all columns for this group (including from subgroups for parent toggle)
  const getAllColumns = (grp: ColumnGroupItem): ColumnId[] => {
    const cols = [...grp.columns];
    if (grp.subgroups) {
      grp.subgroups.forEach((subgroup) => cols.push(...getAllColumns(subgroup)));
    }
    return cols;
  };

  const allColumnIds = getAllColumns(group);
  const groupColumns = allColumnIds
    .map((colId) => table.getColumn(colId))
    .filter((col) => col && col.getCanHide());

  if (groupColumns.length === 0 && !group.subgroups?.length) return null;

  const visibleCount = groupColumns.filter((col) => col?.getIsVisible()).length;
  const allVisible = visibleCount === groupColumns.length && groupColumns.length > 0;
  const someVisible = visibleCount > 0 && visibleCount < groupColumns.length;

  const toggleGroup = (checked: boolean) => {
    groupColumns.forEach((col) => col?.toggleVisibility(checked));
  };

  const directColumns = group.columns
    .map((colId) => table.getColumn(colId))
    .filter((col) => col && col.getCanHide());

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2" style={{ marginLeft: depth * 16 }}>
        <Checkbox
          id={`group-${group.label}`}
          checked={allVisible}
          data-state={someVisible ? "indeterminate" : undefined}
          onCheckedChange={(value) => toggleGroup(!!value)}
        />
        <Label
          htmlFor={`group-${group.label}`}
          className="text-sm font-medium text-muted-foreground cursor-pointer"
        >
          {group.label}
        </Label>
      </div>
      {directColumns.length > 0 && (
        <div className="flex flex-col gap-2" style={{ marginLeft: (depth + 1) * 16 + 8 }}>
          {directColumns.map((column) => {
            if (!column) return null;
            return (
              <div key={column.id} className="flex items-center gap-2">
                <Checkbox
                  id={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                />
                <Label htmlFor={column.id} className="text-sm cursor-pointer">
                  {columnLabels[column.id as ColumnId] || column.id}
                </Label>
              </div>
            );
          })}
        </div>
      )}
      {group.subgroups?.map((subgroup) => (
        <ColumnGroupSection
          key={subgroup.label}
          group={subgroup}
          table={table}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

const PAGE_SIZE = 14;

export function MatchPlayersTable({
  players,
  team,
  minimal = false,
}: MatchPlayersTableProps) {
  const styles = team ? getTeamStyles(team) : null;
  const showBothTeams = !team; // Show both Red/Blue when no specific team is set

  // Calculate which team has more captures (for sorting winner first)
  const winningTeam = useMemo(() => {
    const redCaptures = players
      .filter((player) => player.team === "Red")
      .reduce((sum, player) => sum + player.capturesSum, 0);
    const blueCaptures = players
      .filter((player) => player.team === "Blue")
      .reduce((sum, player) => sum + player.capturesSum, 0);
    return redCaptures >= blueCaptures ? "Red" : "Blue";
  }, [players]);

  const teamPlayers = useMemo(() => {
    if (showBothTeams) {
      const filtered = players.filter(
        (player) => player.team === "Red" || player.team === "Blue",
      );
      // Sort winning team first
      return [...filtered].sort((a, b) => {
        if (a.team === winningTeam && b.team !== winningTeam) return -1;
        if (a.team !== winningTeam && b.team === winningTeam) return 1;
        return 0;
      });
    }
    return players.filter((player) => player.team === team);
  }, [players, team, showBothTeams, winningTeam]);

  // No initial sorting - data is pre-sorted by winning team
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { settings, setMatchPlayersColumns, setLockTeamSort } =
    useTableSettings();
  const columnVisibility = settings.matchPlayersColumns;
  const lockTeamSort = settings.lockTeamSort;

  // Team sort direction: desc when Blue wins (to put Blue first)
  const teamSort = useMemo(
    () => ({ id: "team", desc: winningTeam === "Blue" }),
    [winningTeam],
  );

  // When locked, team sort is always first; filter out any user-added team sort to avoid duplicates
  const effectiveSorting = useMemo((): SortingState => {
    if (!lockTeamSort || !showBothTeams) {
      return sorting;
    }
    const userSorting = sorting.filter((s) => s.id !== "team");
    return [teamSort, ...userSorting];
  }, [lockTeamSort, showBothTeams, sorting, teamSort]);

  const table = useReactTable({
    columns: matchPlayersColumns,
    data: teamPlayers,
    enableMultiSort: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setMatchPlayersColumns,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      sorting: effectiveSorting,
    },
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const showPagination = totalRows > PAGE_SIZE;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {showBothTeams ? (
            winningTeam === "Red" ? (
              <>
                <Badge className="bg-red-500 hover:bg-red-600">Red</Badge>
                <span className="text-muted-foreground">vs</span>
                <Badge className="bg-blue-500 hover:bg-blue-600">Blue</Badge>
              </>
            ) : (
              <>
                <Badge className="bg-blue-500 hover:bg-blue-600">Blue</Badge>
                <span className="text-muted-foreground">vs</span>
                <Badge className="bg-red-500 hover:bg-red-600">Red</Badge>
              </>
            )
          ) : styles ? (
            <Badge className={styles.badge}>{team}</Badge>
          ) : null}
        </h3>
        {!minimal && (
          <div className="flex items-center gap-2 ml-auto">
            {showBothTeams && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLockTeamSort(!lockTeamSort)}
              >
                {lockTeamSort ? (
                  <>
                    <Lock />
                    Teams Locked
                  </>
                ) : (
                  <>
                    <LockOpen />
                    Teams Unlocked
                  </>
                )}
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 />
                  Columns
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Table Settings</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 px-4 pb-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Columns
                  </div>
                  {columnGroups.map((group) => (
                    <ColumnGroupSection
                      key={group.label}
                      group={group}
                      table={table}
                    />
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group">
                {headerGroup.headers.map((header) => {
                  const isSticky = header.column.id === "nameClean";
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "bg-accent group-hover:bg-muted border-b border-zinc-200 dark:border-zinc-800",
                        isSticky && "sticky left-0",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const rowTeam = row.original.team;
                const cellBg =
                  showBothTeams && rowTeam === "Red"
                    ? "bg-red-50 group-hover:bg-red-100 border-red-100 dark:bg-red-950 dark:group-hover:bg-red-900 dark:border-red-900"
                    : showBothTeams && rowTeam === "Blue"
                      ? "bg-blue-50 group-hover:bg-blue-100 border-blue-100 dark:bg-blue-950 dark:group-hover:bg-blue-900 dark:border-blue-900"
                      : undefined;
                return (
                  <TableRow key={row.id} className="group">
                    {row.getVisibleCells().map((cell) => {
                      const isSticky = cell.column.id === "nameClean";
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            cellBg,
                            isSticky && "sticky left-0",
                            "border-b",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={matchPlayersColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <TablePagination table={table} rowCountLabel="player(s)" />
      )}
    </div>
  );
}
