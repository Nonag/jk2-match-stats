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
  matchPlayersColumns: VisibilityState;
}

const defaultSettings: TableSettings = {
  matchPlayersColumns: defaultColumnVisibility,
};

interface TableSettingsContextValue {
  settings: TableSettings;
  setMatchPlayersColumns: (updater: Updater<VisibilityState>) => void;
  resetMatchPlayersColumns: () => void;
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
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  listeners.forEach((listener) => listener());
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

  return (
    <TableSettingsContext.Provider
      value={{
        settings,
        setMatchPlayersColumns,
        resetMatchPlayersColumns,
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
