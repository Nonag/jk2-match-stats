"use client";

import { useMemo, useState } from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { matchPlayersColumns } from "./match-players-columns";
import type { MatchPlayerDetail } from "@/lib/db/match";

interface MatchPlayersTableProps {
  players: MatchPlayerDetail[];
  team?: "Red" | "Blue" | "Spectator";
  minimal?: boolean;
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

// Default visibility: fixed columns always shown, optional columns configurable
const defaultColumnVisibility: VisibilityState = {
  assistsSum: false,
  bcSum: true,
  capturesSum: true,
  clientNumber: false,
  flagGrabsSum: true,
  flagHoldSum: true,
  kdr: true,
  nameClean: true,
  pingMean: false,
  returnsSum: true,
  scoreSum: true,
  timeSum: false,
};

// Column labels for the dropdown menu
const columnLabels: Record<string, string> = {
  assistsSum: "Assists",
  bcSum: "Base Clean Kills",
  capturesSum: "Captures",
  clientNumber: "Client #",
  flagGrabsSum: "Flag Grabs",
  flagHoldSum: "Flag Hold",
  kdr: "K/D/Ratio",
  nameClean: "Player",
  pingMean: "Ping",
  returnsSum: "Returns",
  scoreSum: "Score",
  timeSum: "Time",
};

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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    ...defaultColumnVisibility,
    team: false, // Hide team column visually
  });

  const table = useReactTable({
    data: teamPlayers,
    columns: matchPlayersColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    enableMultiSort: true,
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const showPagination = totalRows > PAGE_SIZE;

  if (teamPlayers.length === 0) {
    return null;
  }

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-45">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnLabels[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const rowTeam = row.original.team;
                const rowClassName = showBothTeams
                  ? rowTeam === "Red"
                    ? "bg-red-500/10 hover:bg-red-500/20 dark:bg-red-500/15 dark:hover:bg-red-500/25"
                    : rowTeam === "Blue"
                      ? "bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-500/15 dark:hover:bg-blue-500/25"
                      : ""
                  : "";
                return (
                  <TableRow key={row.id} className={rowClassName}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
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
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-muted-foreground flex-1 text-sm">
            {totalRows} player(s)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
