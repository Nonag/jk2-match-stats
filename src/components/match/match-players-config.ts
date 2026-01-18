import type { VisibilityState } from "@tanstack/react-table";

/**
 * Column configuration - Single source of truth for all column settings
 *
 * @property label - Full display name shown in settings menu
 * @property shortLabel - Compact label shown in column headers
 * @property group - Category for organizing in the settings dropdown
 * @property isDefault - true = shown by default, false = hidden by default, null = not rendered
 * @property canHide - Whether the column can be toggled in settings (false = always visible)
 */
export interface ColumnConfig {
  canHide: boolean;
  group: ColumnGroup;
  isDefault: boolean | null;
  label: string;
  shortLabel: string;
}

export type ColumnGroup =
  | "combat"
  | "connection"
  | "fixed"
  | "flag"
  | "killBreakdown"
  | "mines"
  | "returnBreakdown";

export const columnGroupLabels: Record<ColumnGroup, string> = {
  combat: "Combat",
  connection: "Connection",
  fixed: "Fixed",
  flag: "Flag Stats",
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
  [ColumnId.team]: { label: "Team", shortLabel: "Team", group: "fixed", isDefault: false, canHide: false },
  [ColumnId.nameClean]: { label: "Player", shortLabel: "Player", group: "fixed", isDefault: true, canHide: false },
  [ColumnId.scoreSum]: { label: "Score", shortLabel: "Score", group: "fixed", isDefault: true, canHide: false },
  [ColumnId.capturesSum]: { label: "Captures", shortLabel: "C", group: "fixed", isDefault: true, canHide: false },
  [ColumnId.returnsSum]: { label: "Returns", shortLabel: "R", group: "fixed", isDefault: true, canHide: false },
  [ColumnId.bcSum]: { label: "Base Clean Kills", shortLabel: "BC", group: "fixed", isDefault: true, canHide: false },

  // Connection stats
  [ColumnId.clientNumber]: { label: "Client Number", shortLabel: "#", group: "connection", isDefault: false, canHide: true },
  [ColumnId.timeSum]: { label: "Time Played", shortLabel: "Time", group: "connection", isDefault: false, canHide: true },
  [ColumnId.pingMean]: { label: "Average Ping", shortLabel: "Ping", group: "connection", isDefault: false, canHide: true },

  // Flag stats
  [ColumnId.flagHoldSum]: { label: "Flag Hold Time", shortLabel: "FH", group: "flag", isDefault: true, canHide: true },
  [ColumnId.flagGrabsSum]: { label: "Flag Grabs", shortLabel: "FG", group: "flag", isDefault: true, canHide: true },

  // Mine stats
  [ColumnId.mineGrabsTotal]: { label: "Total Mine Grabs", shortLabel: "MG", group: "mines", isDefault: false, canHide: true },
  [ColumnId.mineGrabsRedBase]: { label: "Mine Grabs (Red Base)", shortLabel: "MG-R", group: "mines", isDefault: false, canHide: true },
  [ColumnId.mineGrabsBlueBase]: { label: "Mine Grabs (Blue Base)", shortLabel: "MG-B", group: "mines", isDefault: false, canHide: true },
  [ColumnId.mineGrabsNeutral]: { label: "Mine Grabs (Neutral)", shortLabel: "MG-N", group: "mines", isDefault: false, canHide: true },

  // Combat stats
  [ColumnId.kdr]: { label: "Kill/Death Ratio", shortLabel: "K/D/R", group: "combat", isDefault: true, canHide: true },
  [ColumnId.kills]: { label: "Kills", shortLabel: "K", group: "combat", isDefault: false, canHide: true },
  [ColumnId.deaths]: { label: "Deaths", shortLabel: "D", group: "combat", isDefault: false, canHide: true },

  // Kill breakdown
  [ColumnId.dfaKills]: { label: "DFA Kills", shortLabel: "DFA-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.redKills]: { label: "Red Stance Kills", shortLabel: "Red-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.yelKills]: { label: "Yellow Stance Kills", shortLabel: "Yel-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.bluKills]: { label: "Blue Stance Kills", shortLabel: "Blu-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.dbsKills]: { label: "DBS Kills", shortLabel: "DBS-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.bsKills]: { label: "Backstab Kills", shortLabel: "BS-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.mineKills]: { label: "Mine Kills", shortLabel: "Mine-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.upcutKills]: { label: "Uppercut Kills", shortLabel: "Upc-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.ydfaKills]: { label: "YDFA Kills", shortLabel: "YDFA-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.blubsKills]: { label: "Blue Backstab Kills", shortLabel: "BBS-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.doomKills]: { label: "Doom Kills", shortLabel: "Doom-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.turKills]: { label: "Turret Kills", shortLabel: "Tur-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.unknKills]: { label: "Unknown Kills", shortLabel: "Unk-K", group: "killBreakdown", isDefault: false, canHide: true },
  [ColumnId.idleKills]: { label: "Idle Kills", shortLabel: "Idle-K", group: "killBreakdown", isDefault: false, canHide: true },

  // Return breakdown
  [ColumnId.dfaReturns]: { label: "DFA Returns", shortLabel: "DFA-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.redReturns]: { label: "Red Stance Returns", shortLabel: "Red-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.yelReturns]: { label: "Yellow Stance Returns", shortLabel: "Yel-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.bluReturns]: { label: "Blue Stance Returns", shortLabel: "Blu-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.dbsReturns]: { label: "DBS Returns", shortLabel: "DBS-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.dbsAttempts]: { label: "DBS Attempts", shortLabel: "DBS-A", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.bsReturns]: { label: "Backstab Returns", shortLabel: "BS-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.mineReturns]: { label: "Mine Returns", shortLabel: "Mine-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.upcutReturns]: { label: "Uppercut Returns", shortLabel: "Up-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.ydfaReturns]: { label: "YDFA Returns", shortLabel: "YDFA-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.blubsReturns]: { label: "Blue Backstab Returns", shortLabel: "BBS-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.doomReturns]: { label: "Doom Returns", shortLabel: "Doom-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.turReturns]: { label: "Turret Returns", shortLabel: "Tur-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.unknReturns]: { label: "Unknown Returns", shortLabel: "Unk-R", group: "returnBreakdown", isDefault: false, canHide: true },
  [ColumnId.idleReturns]: { label: "Idle Returns", shortLabel: "Idle-R", group: "returnBreakdown", isDefault: false, canHide: true },
};

// Derived: Default column visibility state for TanStack Table
export const defaultColumnVisibility: VisibilityState = Object.fromEntries(
  Object.entries(columnConfig)
    .filter(([, config]) => config.isDefault !== null)
    .map(([key, config]) => [key, config.isDefault as boolean]),
);

// Derived: Column labels lookup
export const columnLabels: Record<ColumnId, string> = Object.fromEntries(
  Object.entries(columnConfig).map(([key, config]) => [key, config.label]),
) as Record<ColumnId, string>;

// Derived: Column groups for settings panel (built from columnConfig order)
export const columnGroups = Object.entries(columnConfig).reduce<
  { label: string; columns: ColumnId[] }[]
>((groups, [key, config]) => {
  if (config.group === "fixed" || !config.canHide) return groups;

  const existingGroup = groups.find((g) => g.label === columnGroupLabels[config.group]);
  if (existingGroup) {
    existingGroup.columns.push(key as ColumnId);
  } else {
    groups.push({
      label: columnGroupLabels[config.group],
      columns: [key as ColumnId],
    });
  }
  return groups;
}, []);
