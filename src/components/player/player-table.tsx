"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import { TablePagination } from "@/components/common/table-pagination";
import { cn } from "@/lib/utils";
import {
  columnGroups,
  columnLabels,
  type ColumnGroupItem,
  type ColumnId,
} from "@/components/match/match-players-config";
import { useTableSettings } from "@/providers";
import { playerListColumns, PlayerColumnId } from "./player-columns";
import { PlayerDialog } from "./player-dialog";
import type { PlayerListItem } from "@/lib/db/player";

interface PlayerTableProps {
  items: PlayerListItem[];
  loading?: boolean;
}

// Extended column labels to include player-specific columns
const playerColumnLabels: Record<string, string> = {
  ...columnLabels,
  [PlayerColumnId.matchCount]: "Matches",
  [PlayerColumnId.matchDate]: "Match Date",
};

interface ColumnGroupSectionProps {
  depth?: number;
  group: ColumnGroupItem;
  table: ReturnType<typeof useReactTable<PlayerListItem>>;
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
                  {playerColumnLabels[column.id] || column.id}
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

const PAGE_SIZE = 10;

export function PlayerTable({ items, loading }: PlayerTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedItem, setSelectedItem] = useState<PlayerListItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { settings, setMatchPlayersColumns, setPlayerFilterMode } = useTableSettings();

  const columnVisibility = settings.matchPlayersColumns;
  const playerFilterMode = settings.playerFilterMode;

  // Filter items based on playerFilterMode
  const filteredItems = useMemo(() => {
    if (playerFilterMode === "all") return items;
    return items.filter((item) => item.type === playerFilterMode);
  }, [items, playerFilterMode]);

  const handleNameClick = (item: PlayerListItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleRowClick = (item: PlayerListItem) => {
    // Navigate to player detail page for players
    if (item.type === "player") {
      router.push(`/players/${item.id}`);
    }
    // Navigate to match detail page for matchplayers that have a matchId
    else if (item.type === "matchplayer" && item.matchId) {
      router.push(`/matches/${item.matchId}`);
    }
  };

  const table = useReactTable({
    columns: playerListColumns,
    data: filteredItems,
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
    meta: {
      onNameClick: handleNameClick,
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setMatchPlayersColumns,
    onSortingChange: setSorting,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const totalRows = table.getFilteredRowModel().rows.length;
  const showPagination = totalRows > PAGE_SIZE;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading players...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">
          No players found. Import match data to see players.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between py-2">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("nameClean")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("nameClean")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <ButtonGroup>
            <Button
              onClick={() => setPlayerFilterMode("all")}
              size="sm"
              variant={playerFilterMode === "all" ? "default" : "outline"}
            >
              All
            </Button>
            <Button
              onClick={() => setPlayerFilterMode("player")}
              size="sm"
              variant={playerFilterMode === "player" ? "default" : "outline"}
            >
              Players
            </Button>
            <Button
              onClick={() => setPlayerFilterMode("matchplayer")}
              size="sm"
              variant={playerFilterMode === "matchplayer" ? "default" : "outline"}
            >
              Unassigned
            </Button>
          </ButtonGroup>
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
              {/* Player-specific columns */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Player Info
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {[PlayerColumnId.matchCount, PlayerColumnId.matchDate].map((colId) => {
                    const column = table.getColumn(colId);
                    if (!column || !column.getCanHide()) return null;
                    return (
                      <div key={colId} className="flex items-center gap-2">
                        <Checkbox
                          id={colId}
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        />
                        <Label htmlFor={colId} className="text-sm cursor-pointer">
                          {playerColumnLabels[colId]}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Match stats columns */}
              <div className="text-sm font-medium text-muted-foreground">
                Match Stats
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
                        isSticky && "sticky left-0 z-10",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                const cellBg = "bg-background group-hover:bg-muted";
                const isMatchPlayer = row.original.type === "matchplayer";
                return (
                  <TableRow
                    key={row.id}
                    className={cn("group", isMatchPlayer && "cursor-pointer")}
                    onClick={() => handleRowClick(row.original)}
                  >
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
                            cell.getContext()
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
                  colSpan={playerListColumns.length}
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
      <PlayerDialog
        item={selectedItem}
        open={dialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
}
