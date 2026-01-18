import type { VisibilityState } from "@tanstack/react-table";

/**
 * Column configuration - Single source of truth for all column settings
 *
 * @property label - Display name shown in column header and settings menu
 * @property group - Category for organizing in the settings dropdown
 * @property defaultVisible - true = shown, false = hidden, null = not rendered
 * @property canHide - Whether the column can be toggled in settings (false = always visible)
 */
export interface ColumnConfig {
  label: string;
  group: ColumnGroup;
  defaultVisible: boolean | null;
  canHide: boolean;
}

export type ColumnGroup =
  | "fixed"
  | "combat"
  | "connection"
  | "core"
  | "killBreakdown"
  | "mines"
  | "returnBreakdown";

export const columnGroupLabels: Record<ColumnGroup, string> = {
  combat: "Combat",
  connection: "Connection",
  core: "Core Stats",
  fixed: "Fixed",
  killBreakdown: "Kill Breakdown",
  mines: "Mine Stats",
  returnBreakdown: "Return Breakdown",
};

export enum ColumnId {
  bcSum = "bcSum",
  blubsKills = "blubsKills",
  blubsReturns = "blubsReturns",
  bluKills = "bluKills",
  bluReturns = "bluReturns",
  bsKills = "bsKills",
  bsReturns = "bsReturns",
  capturesSum = "capturesSum",
  clientNumber = "clientNumber",
  dbsAttempts = "dbsAttempts",
  dbsKills = "dbsKills",
  dbsReturns = "dbsReturns",
  deaths = "deaths",
  dfaKills = "dfaKills",
  dfaReturns = "dfaReturns",
  doomKills = "doomKills",
  doomReturns = "doomReturns",
  flagGrabsSum = "flagGrabsSum",
  flagHoldSum = "flagHoldSum",
  idleKills = "idleKills",
  idleReturns = "idleReturns",
  kdr = "kdr", // computed
  kills = "kills",
  mineGrabsBlueBase = "mineGrabsBlueBase",
  mineGrabsNeutral = "mineGrabsNeutral",
  mineGrabsRedBase = "mineGrabsRedBase",
  mineGrabsTotal = "mineGrabsTotal",
  mineKills = "mineKills",
  mineReturns = "mineReturns",
  nameClean = "nameClean",
  pingMean = "pingMean",
  redKills = "redKills",
  redReturns = "redReturns",
  returnsSum = "returnsSum",
  scoreSum = "scoreSum",
  team = "team",
  timeSum = "timeSum",
  turKills = "turKills",
  turReturns = "turReturns",
  unknKills = "unknKills",
  unknReturns = "unknReturns",
  upcutKills = "upcutKills",
  upcutReturns = "upcutReturns",
  ydfaKills = "ydfaKills",
  ydfaReturns = "ydfaReturns",
  yelKills = "yelKills",
  yelReturns = "yelReturns",
}

/**
 * Master column configuration
 * All column settings are defined here and derived elsewhere
 */
export const columnConfig: Record<ColumnId, ColumnConfig> = {
  // Fixed columns - always visible, cannot be hidden
  [ColumnId.team]: { label: "Team", group: "fixed", defaultVisible: false, canHide: false },
  [ColumnId.nameClean]: { label: "Player", group: "fixed", defaultVisible: true, canHide: false },
  [ColumnId.scoreSum]: { label: "Score", group: "fixed", defaultVisible: true, canHide: false },
  [ColumnId.capturesSum]: { label: "Captures", group: "fixed", defaultVisible: true, canHide: false },
  [ColumnId.returnsSum]: { label: "Returns", group: "fixed", defaultVisible: true, canHide: false },
  [ColumnId.bcSum]: { label: "Base Clean", group: "fixed", defaultVisible: true, canHide: false },

  // Core stats
  [ColumnId.flagHoldSum]: { label: "Flag Hold", group: "core", defaultVisible: true, canHide: true },
  [ColumnId.flagGrabsSum]: { label: "Flag Grabs", group: "core", defaultVisible: true, canHide: true },

  // Combat stats
  [ColumnId.kdr]: { label: "K/D/Ratio", group: "combat", defaultVisible: true, canHide: true },
  [ColumnId.kills]: { label: "Kills", group: "combat", defaultVisible: false, canHide: true },
  [ColumnId.deaths]: { label: "Deaths", group: "combat", defaultVisible: false, canHide: true },

  // Connection stats
  [ColumnId.clientNumber]: { label: "Client #", group: "connection", defaultVisible: false, canHide: true },
  [ColumnId.timeSum]: { label: "Time", group: "connection", defaultVisible: false, canHide: true },
  [ColumnId.pingMean]: { label: "Ping", group: "connection", defaultVisible: false, canHide: true },

  // Mine stats
  [ColumnId.mineGrabsTotal]: { label: "Mine Grabs", group: "mines", defaultVisible: false, canHide: true },
  [ColumnId.mineGrabsRedBase]: { label: "Mines (Red)", group: "mines", defaultVisible: false, canHide: true },
  [ColumnId.mineGrabsBlueBase]: { label: "Mines (Blue)", group: "mines", defaultVisible: false, canHide: true },
  [ColumnId.mineGrabsNeutral]: { label: "Mines (Mid)", group: "mines", defaultVisible: false, canHide: true },

  // Kill breakdown
  [ColumnId.dfaKills]: { label: "DFA Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.redKills]: { label: "Red Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.yelKills]: { label: "Yellow Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.bluKills]: { label: "Blue Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.dbsKills]: { label: "DBS Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.bsKills]: { label: "Backstab Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.mineKills]: { label: "Mine Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.upcutKills]: { label: "Upcut Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.ydfaKills]: { label: "YDFA Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.blubsKills]: { label: "Blue BS Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.doomKills]: { label: "Doom Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.turKills]: { label: "Turret Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.unknKills]: { label: "Unknown Kills", group: "killBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.idleKills]: { label: "Idle Kills", group: "killBreakdown", defaultVisible: false, canHide: true },

  // Return breakdown
  [ColumnId.dfaReturns]: { label: "DFA Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.redReturns]: { label: "Red Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.yelReturns]: { label: "Yellow Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.bluReturns]: { label: "Blue Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.dbsReturns]: { label: "DBS Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.dbsAttempts]: { label: "DBS Attempts", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.bsReturns]: { label: "Backstab Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.mineReturns]: { label: "Mine Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.upcutReturns]: { label: "Upcut Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.ydfaReturns]: { label: "YDFA Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.blubsReturns]: { label: "Blue BS Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.doomReturns]: { label: "Doom Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.turReturns]: { label: "Turret Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.unknReturns]: { label: "Unknown Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
  [ColumnId.idleReturns]: { label: "Idle Returns", group: "returnBreakdown", defaultVisible: false, canHide: true },
};

// Derived: Default column visibility state for TanStack Table
export const defaultColumnVisibility: VisibilityState = Object.fromEntries(
  Object.entries(columnConfig)
    .filter(([, config]) => config.defaultVisible !== null)
    .map(([key, config]) => [key, config.defaultVisible as boolean]),
);

// Derived: Column labels lookup
export const columnLabels: Record<ColumnId, string> = Object.fromEntries(
  Object.entries(columnConfig).map(([key, config]) => [key, config.label]),
) as Record<ColumnId, string>;

// Derived: Column groups for dropdown menu (excludes "fixed" group)
export const columnGroups = (
  Object.keys(columnGroupLabels) as ColumnGroup[]
)
  .filter((group) => group !== "fixed")
  .map((group) => ({
    label: columnGroupLabels[group],
    columns: Object.entries(columnConfig)
      .filter(([, config]) => config.group === group && config.canHide)
      .map(([key]) => key as ColumnId),
  }))
  .filter((group) => group.columns.length > 0);
