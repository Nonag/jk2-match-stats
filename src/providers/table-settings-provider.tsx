"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { type Updater, type VisibilityState } from "@tanstack/react-table";
import { defaultColumnVisibility } from "@/components/match/match-players-config";

const STORAGE_KEY = "table-settings";

interface TableSettings {
  lockTeamSort: boolean;
  matchPlayersColumns: VisibilityState;
  pageSize: number;
}

const DEFAULT_PAGE_SIZE = 10;

const defaultSettings: TableSettings = {
  lockTeamSort: true,
  matchPlayersColumns: defaultColumnVisibility,
  pageSize: DEFAULT_PAGE_SIZE,
};

interface TableSettingsContextValue {
  resetMatchPlayersColumns: () => void;
  setLockTeamSort: (locked: boolean) => void;
  setMatchPlayersColumns: (updater: Updater<VisibilityState>) => void;
  setPageSize: (size: number) => void;
  settings: TableSettings;
}

const TableSettingsContext = createContext<TableSettingsContextValue | null>(
  null,
);

let currentSettings: TableSettings = defaultSettings;
const listeners = new Set<() => void>();

function getSnapshot(): TableSettings {
  return currentSettings;
}

function getServerSnapshot(): TableSettings {
  return defaultSettings;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function updateSettings(newSettings: TableSettings) {
  currentSettings = newSettings;
  listeners.forEach((listener) => listener());
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
}

// Initialize from storage on first load (client-side only)
if (typeof window !== "undefined") {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      currentSettings = { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
}

export function TableSettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setMatchPlayersColumns = useCallback(
    (updater: Updater<VisibilityState>) => {
      const newVisibility =
        typeof updater === "function"
          ? updater(currentSettings.matchPlayersColumns)
          : updater;
      updateSettings({ ...currentSettings, matchPlayersColumns: newVisibility });
    },
    [],
  );

  const resetMatchPlayersColumns = useCallback(() => {
    updateSettings({
      ...currentSettings,
      matchPlayersColumns: defaultColumnVisibility,
    });
  }, []);

  const setLockTeamSort = useCallback((locked: boolean) => {
    updateSettings({ ...currentSettings, lockTeamSort: locked });
  }, []);

  const setPageSize = useCallback((size: number) => {
    updateSettings({ ...currentSettings, pageSize: size });
  }, []);

  return (
    <TableSettingsContext.Provider
      value={{
        resetMatchPlayersColumns,
        setLockTeamSort,
        setMatchPlayersColumns,
        setPageSize,
        settings,
      }}
    >
      {children}
    </TableSettingsContext.Provider>
  );
}

export function useTableSettings() {
  const context = useContext(TableSettingsContext);
  if (!context) {
    throw new Error(
      "useTableSettings must be used within a TableSettingsProvider",
    );
  }
  return context;
}
