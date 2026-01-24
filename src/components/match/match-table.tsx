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
import { addDays, format, subDays, subMonths, subYears } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import { TablePagination } from "@/components/common/table-pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { matchColumns } from "./match-columns";
import type { MatchSummary } from "@/lib/db/match";

export type DatePreset = "week" | "month" | "year" | "custom";

interface MatchTableProps {
  datePreset: DatePreset;
  dateRange: DateRange | undefined;
  loading?: boolean;
  matches: MatchSummary[];
  onDatePresetChange: (preset: DatePreset) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function MatchTable({
  datePreset,
  dateRange,
  loading,
  matches,
  onDatePresetChange,
  onDateRangeChange,
}: MatchTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const handlePresetChange = (preset: DatePreset) => {
    onDatePresetChange(preset);
    const today = new Date();
    switch (preset) {
      case "week":
        onDateRangeChange({ from: subDays(today, 7), to: today });
        break;
      case "month":
        onDateRangeChange({ from: subMonths(today, 1), to: today });
        break;
      case "year":
        onDateRangeChange({ from: subYears(today, 1), to: today });
        break;
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onDateRangeChange(range);
    onDatePresetChange("custom");
  };

  const filteredMatches = useMemo(() => {
    if (!dateRange?.from) return matches;

    return matches.filter((match) => {
      const matchDate = new Date(match.date);
      const from = dateRange.from!;
      const to = dateRange.to ?? addDays(from, 1);
      return matchDate >= from && matchDate <= to;
    });
  }, [matches, dateRange]);

  const table = useReactTable({
    data: filteredMatches,
    columns: matchColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading matches...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">
          No matches found. Import a CSV file to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 py-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className={cn(
                "justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
              variant="outline"
            >
              <CalendarIcon />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    <span className="hidden sm:inline">
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </span>
                    <span className="sm:hidden">
                      {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                    </span>
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              autoFocus
              defaultMonth={dateRange?.from}
              mode="range"
              numberOfMonths={1}
              onSelect={handleDateRangeChange}
              selected={dateRange}
            />
          </PopoverContent>
        </Popover>
        <ButtonGroup className="ml-auto">
          <Button
            onClick={() => handlePresetChange("week")}
            size="sm"
            variant={datePreset === "week" ? "default" : "outline"}
          >
            <span className="hidden sm:inline">Week</span>
            <span className="sm:hidden">W</span>
          </Button>
          <Button
            onClick={() => handlePresetChange("month")}
            size="sm"
            variant={datePreset === "month" ? "default" : "outline"}
          >
            <span className="hidden sm:inline">Month</span>
            <span className="sm:hidden">M</span>
          </Button>
          <Button
            onClick={() => handlePresetChange("year")}
            size="sm"
            variant={datePreset === "year" ? "default" : "outline"}
          >
            <span className="hidden sm:inline">Year</span>
            <span className="sm:hidden">Y</span>
          </Button>
        </ButtonGroup>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-accent group-hover:bg-muted border-b border-zinc-200 dark:border-zinc-800"
                  >
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/matches/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={matchColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination table={table} rowCountLabel="match(es)" />
    </div>
  );
}
