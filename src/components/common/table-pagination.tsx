"use client";

import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  showRowCount?: boolean;
  rowCountLabel?: string;
  page?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function TablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50],
  showRowCount = true,
  rowCountLabel = "row(s)",
  page,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const currentPage = page ?? pageIndex + 1;

  return (
    <div className="flex items-center justify-between py-4">
      {showRowCount && (
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredRowModel().rows.length} {rowCountLabel}
        </div>
      )}
      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              const size = Number(value);
              if (onPageSizeChange) {
                onPageSizeChange(size);
              } else {
                table.setPageSize(size);
              }
            }}
          >
            <SelectTrigger className="h-8 w-18">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-25 items-center justify-center text-sm font-medium">
          Page {currentPage} of {pageCount}
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="hidden size-8 lg:flex"
            disabled={currentPage <= 1}
            onClick={() => onPageChange ? onPageChange(1) : table.setPageIndex(0)}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            className="size-8"
            disabled={currentPage <= 1}
            onClick={() => onPageChange ? onPageChange(currentPage - 1) : table.previousPage()}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            className="size-8"
            disabled={currentPage >= pageCount}
            onClick={() => onPageChange ? onPageChange(currentPage + 1) : table.nextPage()}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            className="hidden size-8 lg:flex"
            disabled={currentPage >= pageCount}
            onClick={() => onPageChange ? onPageChange(pageCount) : table.setPageIndex(pageCount - 1)}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
