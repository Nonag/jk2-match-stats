"use client";

import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SortableHeaderProps<TData> {
  column: Column<TData, unknown>;
  /** Whether to support multi-sort with shift+click */
  enableMultiSort?: boolean;
  label: string;
  /** Short label to display (defaults to label) */
  shortLabel?: string;
  /** Sort priority to show as badge (undefined = don't show) */
  sortPriority?: number;
}

export function SortableHeader<TData>({
  column,
  enableMultiSort = false,
  label,
  shortLabel,
  sortPriority,
}: SortableHeaderProps<TData>) {
  const sorted = column.getIsSorted();
  const displayLabel = shortLabel ?? label;
  const showTooltip = shortLabel !== undefined && shortLabel !== label;

  const handleClick = (event: React.MouseEvent) => {
    if (sorted === "asc") {
      column.clearSorting();
    } else if (sorted === "desc") {
      column.toggleSorting(false, enableMultiSort && event.shiftKey);
    } else {
      column.toggleSorting(true, enableMultiSort && event.shiftKey);
    }
  };

  const content = (
    <div className="flex items-center gap-1">
      <span className="relative">
        {displayLabel}
        {sortPriority !== undefined && sortPriority >= 0 && (
          <Badge
            className="absolute -top-2 -left-4 min-w-4 h-4 px-1 text-[10px]"
            variant="secondary"
          >
            {sortPriority}
          </Badge>
        )}
      </span>
      <Button onClick={handleClick} size="icon-sm" variant="link">
        {sorted === "asc" ? (
          <ArrowUp />
        ) : sorted === "desc" ? (
          <ArrowDown />
        ) : (
          <ArrowUpDown className="text-muted-foreground" />
        )}
      </Button>
    </div>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
