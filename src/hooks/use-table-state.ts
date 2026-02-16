"use client";

import { useQueryStates, parseAsInteger, parseAsIndex, createParser } from "nuqs";
import { useMemo } from "react";
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";

/**
 * Syncs TanStack Table state with URL search params
 * All state is stored in URL for persistence across navigation
 */

const sortingParser = createParser<SortingState>({
  parse: (value) => {
    try {
      return JSON.parse(value) as SortingState;
    } catch {
      return [];
    }
  },
  serialize: (value) => JSON.stringify(value),
}).withDefault([]);

const filtersParser = createParser<ColumnFiltersState>({
  parse: (value) => {
    try {
      return JSON.parse(value) as ColumnFiltersState;
    } catch {
      return [];
    }
  },
  serialize: (value) => JSON.stringify(value),
}).withDefault([]);

interface UseTableStateConfig {
  defaultPageIndex?: number;
  defaultPageSize?: number;
  /**
   * Prefix for URL params to avoid conflicts when multiple tables on same page
   * e.g., "spec" -> "specPage", "specPageSize", "specSort", "specFilter"
   */
  prefix?: string;
}

/**
 * Syncs TanStack Table state with URL search params
 * All state is stored in URL for persistence across navigation
 */
export function useTableState(config: UseTableStateConfig = {}) {
  const {
    defaultPageIndex = 0,
    defaultPageSize = 10,
  } = config;

  const [state, setState] = useQueryStates(
    {
      filter: filtersParser,
      page: parseAsIndex.withDefault(defaultPageIndex),
      pageSize: parseAsInteger.withDefault(defaultPageSize),
      sort: sortingParser,
    },
    {
      history: "push",
      shallow: true,
    },
  );

  // Convert to TanStack Table state shape
  const sorting: SortingState = state.sort ?? [];
  const columnFilters: ColumnFiltersState = state.filter ?? [];
  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: state.page,
      pageSize: state.pageSize,
    }),
    [state.page, state.pageSize],
  );

  const setSorting = (updater: SortingState | ((old: SortingState) => SortingState)) => {
    const newValue = typeof updater === "function" ? updater(sorting) : updater;
    setState({ page: 0, sort: !newValue.length ? null : newValue });
  };

  const setColumnFilters = (
    updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState),
  ) => {
    const newValue = typeof updater === "function" ? updater(columnFilters) : updater;
    setState({ filter: !newValue.length ? null : newValue, page: 0 });
  };

  const setPagination = (
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) => {
    const newValue = typeof updater === "function" ? updater(pagination) : updater;
    setState({
      page: newValue.pageIndex,
      pageSize: newValue.pageSize,
    });
  };

  return {
    columnFilters,
    pagination,
    setColumnFilters,
    setPageSize: (size: number) => setState({ pageSize: size }),
    setPagination,
    setSorting,
    sorting,
  };
}
