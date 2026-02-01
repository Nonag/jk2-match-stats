"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { type Updater, type VisibilityState } from "@tanstack/react-table";
import { defaultColumnVisibility } from "@/components/match/match-player-config";

const MATCH_PLAYER_TABLE_COLUMNS_KEY = "match-player-table-columns";
const PLAYER_TABLE_COLUMNS_KEY = "player-table-columns";

/**
 * Table settings provider - stores ONLY column visibility per table
 * All other table state (sorting, filters, pagination, mode, lock) is in URL params
 */
interface TableSettings {
  matchPlayerTableColumns: VisibilityState;
  playerTableColumns: VisibilityState;
}

const defaultSettings: TableSettings = {
  matchPlayerTableColumns: defaultColumnVisibility,
  playerTableColumns: defaultColumnVisibility,
};

interface TableSettingsContextValue {
  resetMatchPlayerTableColumns: () => void;
  resetPlayerTableColumns: () => void;
  setMatchPlayerTableColumns: (updater: Updater<VisibilityState>) => void;
  setPlayerTableColumns: (updater: Updater<VisibilityState>) => void;
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
  sessionStorage.setItem(MATCH_PLAYER_TABLE_COLUMNS_KEY, JSON.stringify(newSettings.matchPlayerTableColumns));
  sessionStorage.setItem(PLAYER_TABLE_COLUMNS_KEY, JSON.stringify(newSettings.playerTableColumns));
}

// Initialize from storage on first load (client-side only)
if (typeof window !== "undefined") {
  try {
    const matchPlayerTableColumns = sessionStorage.getItem(MATCH_PLAYER_TABLE_COLUMNS_KEY);
    const playerTableColumns = sessionStorage.getItem(PLAYER_TABLE_COLUMNS_KEY);

    currentSettings = {
      matchPlayerTableColumns: matchPlayerTableColumns ? JSON.parse(matchPlayerTableColumns) : defaultColumnVisibility,
      playerTableColumns: playerTableColumns ? JSON.parse(playerTableColumns) : defaultColumnVisibility,
    };
  } catch {
    // Ignore parse errors
  }
}

export function TableSettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setPlayerTableColumns = useCallback(
    (updater: Updater<VisibilityState>) => {
      const newVisibility =
        typeof updater === "function"
          ? updater(currentSettings.playerTableColumns)
          : updater;
      updateSettings({ ...currentSettings, playerTableColumns: newVisibility });
    },
    [],
  );

  const setMatchPlayerTableColumns = useCallback(
    (updater: Updater<VisibilityState>) => {
      const newVisibility =
        typeof updater === "function"
          ? updater(currentSettings.matchPlayerTableColumns)
          : updater;
      updateSettings({ ...currentSettings, matchPlayerTableColumns: newVisibility });
    },
    [],
  );

  const resetPlayerTableColumns = useCallback(() => {
    updateSettings({
      ...currentSettings,
      playerTableColumns: defaultColumnVisibility,
    });
  }, []);

  const resetMatchPlayerTableColumns = useCallback(() => {
    updateSettings({
      ...currentSettings,
      matchPlayerTableColumns: defaultColumnVisibility,
    });
  }, []);

  return (
    <TableSettingsContext.Provider
      value={{
        resetMatchPlayerTableColumns,
        resetPlayerTableColumns,
        setMatchPlayerTableColumns,
        setPlayerTableColumns,
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
