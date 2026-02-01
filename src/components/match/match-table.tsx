"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format, subDays, subMonths, subYears, addDays } from "date-fns";
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
import { useTableState } from "@/hooks/use-table-state";
import { useQueryStates, parseAsIsoDateTime, parseAsString } from "nuqs";
import { matchColumns } from "./match-columns";
import type { MatchSummary } from "@/lib/db/match";

export type DatePreset = "week" | "month" | "year" | "custom";

interface MatchTableProps {
  loading?: boolean;
  matches: MatchSummary[];
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

export function MatchTable({ loading, matches, onDateRangeChange }: MatchTableProps) {
  const router = useRouter();

  const { sorting, pagination, setSorting, setPagination } = useTableState({ defaultPageSize: 10 });

  const [dateState, setDateState] = useQueryStates(
    {
      datePreset: parseAsString,
      from: parseAsIsoDateTime,
      to: parseAsIsoDateTime,
    },
    { history: "push", shallow: true },
  );

  const datePreset = (dateState.datePreset as DatePreset | null) ?? undefined;
  const dateRange = useMemo(() => {
    if (!dateState.from) return undefined;
    return { from: dateState.from, to: dateState.to ?? undefined };
  }, [dateState.from, dateState.to]);

  // Notify parent when date range changes
  useMemo(() => {
    onDateRangeChange?.(dateRange);
  }, [dateRange, onDateRangeChange]);

  // Filter matches by date range client-side
  const filteredMatches = useMemo(() => {
    if (!dateRange?.from) return matches;

    return matches.filter((match) => {
      const matchDate = new Date(match.date);
      const from = dateRange.from!;
      const to = dateRange.to ?? addDays(from, 1);
      return matchDate >= from && matchDate <= to;
    });
  }, [matches, dateRange]);

  const handlePresetChange = (preset: DatePreset) => {
    const today = new Date();
    let newRange: DateRange | undefined;

    switch (preset) {
      case "week":
        newRange = { from: subDays(today, 7), to: today };
        break;
      case "month":
        newRange = { from: subMonths(today, 1), to: today };
        break;
      case "year":
        newRange = { from: subYears(today, 1), to: today };
        break;
    }

    setDateState({ datePreset: preset, from: newRange?.from ?? null, to: newRange?.to ?? null });
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateState({ datePreset: "custom", from: range?.from ?? null, to: range?.to ?? null });
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  const table = useReactTable({
    autoResetPageIndex: false,
    columns: matchColumns,
    data: filteredMatches,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading matches...</p>
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
                  {matches.length === 0
                    ? "No matches found. Import a CSV file to get started."
                    : "No matches found for selected date range."}
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
