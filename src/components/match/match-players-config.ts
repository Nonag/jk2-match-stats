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
  | "blocks"
  | "combat"
  | "connection"
  | "fixed"
  | "flag"
  | "kills-blubs"
  | "kills-blu"
  | "kills-bs"
  | "kills-dbs"
  | "kills-dfa"
  | "kills-doom"
  | "kills-idle"
  | "kills-mine"
  | "kills-red"
  | "kills-tur"
  | "kills-unkn"
  | "kills-upcut"
  | "kills-ydfa"
  | "kills-yel"
  | "mines";

export const columnGroupLabels: Record<ColumnGroup, string> = {
  blocks: "Blocking",
  combat: "Combat",
  connection: "Connection",
  fixed: "Fixed",
  flag: "Flags",
  "kills-blubs": "Blue Backstab",
  "kills-blu": "Blue Stance",
  "kills-bs": "Backstab",
  "kills-dbs": "DBS",
  "kills-dfa": "DFA",
  "kills-doom": "Doom",
  "kills-idle": "Idle",
  "kills-mine": "Mine",
  "kills-red": "Red Stance",
  "kills-tur": "Turret",
  "kills-unkn": "Unknown",
  "kills-upcut": "Uppercut",
  "kills-ydfa": "YDFA",
  "kills-yel": "Yellow Stance",
  mines: "Mines",
};

export enum ColumnId {
  bcSum = "bcSum",
  blubsAttempts = "blubsAttempts",
  blubsCombined = "blubsCombined", // computed
  blubsKills = "blubsKills",
  blubsReturns = "blubsReturns",
  blocksEnemy = "blocksEnemy",
  blocksEnemyCapper = "blocksEnemyCapper",
  blocksTeam = "blocksTeam",
  blocksTeamCapper = "blocksTeamCapper",
  bluCombined = "bluCombined", // computed
  bluKills = "bluKills",
  bluReturns = "bluReturns",
  bsAttempts = "bsAttempts",
  bsCombined = "bsCombined", // computed
  bsKills = "bsKills",
  bsReturns = "bsReturns",
  capturesSum = "capturesSum",
  clientNumber = "clientNumber",
  dbsAttempts = "dbsAttempts",
  dbsCombined = "dbsCombined", // computed
  dbsKills = "dbsKills",
  dbsReturns = "dbsReturns",
  deaths = "deaths",
  dfaAttempts = "dfaAttempts",
  dfaCombined = "dfaCombined", // computed
  dfaKills = "dfaKills",
  dfaReturns = "dfaReturns",
  doomCombined = "doomCombined", // computed
  doomKills = "doomKills",
  doomReturns = "doomReturns",
  flagGrabsSum = "flagGrabsSum",
  flagHoldSum = "flagHoldSum",
  idleCombined = "idleCombined", // computed
  idleKills = "idleKills",
  idleReturns = "idleReturns",
  kdr = "kdr", // computed
  kills = "kills",
  mineGrabsBlueBase = "mineGrabsBlueBase",
  mineGrabsNeutral = "mineGrabsNeutral",
  mineGrabsRedBase = "mineGrabsRedBase",
  mineGrabsTotal = "mineGrabsTotal",
  mineCombined = "mineCombined", // computed
  mineKills = "mineKills",
  mineReturns = "mineReturns",
  nameClean = "nameClean",
  pingMean = "pingMean",
  redCombined = "redCombined", // computed
  redKills = "redKills",
  redReturns = "redReturns",
  returnsSum = "returnsSum",
  scoreSum = "scoreSum",
  team = "team",
  timeSum = "timeSum",
  turCombined = "turCombined", // computed
  turKills = "turKills",
  turReturns = "turReturns",
  unknCombined = "unknCombined", // computed
  unknKills = "unknKills",
  unknReturns = "unknReturns",
  upcutCombined = "upcutCombined", // computed
  upcutKills = "upcutKills",
  upcutReturns = "upcutReturns",
  ydfaAttempts = "ydfaAttempts",
  ydfaCombined = "ydfaCombined", // computed
  ydfaKills = "ydfaKills",
  ydfaReturns = "ydfaReturns",
  yelCombined = "yelCombined", // computed
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

  // Connection
  [ColumnId.clientNumber]: { label: "Client Number", shortLabel: "#", group: "connection", isDefault: false, canHide: true },
  [ColumnId.timeSum]: { label: "Time Played", shortLabel: "Time", group: "connection", isDefault: false, canHide: true },
  [ColumnId.pingMean]: { label: "Average Ping", shortLabel: "Ping", group: "connection", isDefault: false, canHide: true },

  // Flags
  [ColumnId.flagHoldSum]: { label: "Flag Hold Time", shortLabel: "FH", group: "flag", isDefault: true, canHide: true },
  [ColumnId.flagGrabsSum]: { label: "Flag Grabs", shortLabel: "FG", group: "flag", isDefault: true, canHide: true },

  // Mine
  [ColumnId.mineGrabsTotal]: { label: "Total Mine Grabs", shortLabel: "MG", group: "mines", isDefault: false, canHide: true },
  [ColumnId.mineGrabsRedBase]: { label: "Mine Grabs (Red Base)", shortLabel: "MG-R", group: "mines", isDefault: false, canHide: true },
  [ColumnId.mineGrabsBlueBase]: { label: "Mine Grabs (Blue Base)", shortLabel: "MG-B", group: "mines", isDefault: false, canHide: true },
  [ColumnId.mineGrabsNeutral]: { label: "Mine Grabs (Neutral)", shortLabel: "MG-N", group: "mines", isDefault: false, canHide: true },

  // Combat
  [ColumnId.kdr]: { label: "Kill/Death Ratio", shortLabel: "K/D R", group: "combat", isDefault: true, canHide: true },
  [ColumnId.kills]: { label: "Kills", shortLabel: "K", group: "combat", isDefault: false, canHide: true },
  [ColumnId.deaths]: { label: "Deaths", shortLabel: "D", group: "combat", isDefault: false, canHide: true },

  // Blocking
  [ColumnId.blocksEnemy]: { label: "Enemy Blocks", shortLabel: "Blk-E", group: "blocks", isDefault: false, canHide: true },
  [ColumnId.blocksEnemyCapper]: { label: "Enemy Capper Blocks", shortLabel: "Blk-EC", group: "blocks", isDefault: false, canHide: true },
  [ColumnId.blocksTeam]: { label: "Team Blocks", shortLabel: "Blk-T", group: "blocks", isDefault: false, canHide: true },
  [ColumnId.blocksTeamCapper]: { label: "Team Capper Blocks", shortLabel: "Blk-TC", group: "blocks", isDefault: false, canHide: true },

  // Kills - Doom
  [ColumnId.doomCombined]: { label: "Doom Combined", shortLabel: "D", group: "kills-doom", isDefault: true, canHide: true },
  [ColumnId.doomKills]: { label: "Doom Kills", shortLabel: "D-K", group: "kills-doom", isDefault: false, canHide: true },
  [ColumnId.doomReturns]: { label: "Doom Returns", shortLabel: "D-R", group: "kills-doom", isDefault: false, canHide: true },

  // Kills - DBS
  [ColumnId.dbsCombined]: { label: "DBS Combined", shortLabel: "DBS", group: "kills-dbs", isDefault: true, canHide: true },
  [ColumnId.dbsAttempts]: { label: "DBS Attempts", shortLabel: "DBS-A", group: "kills-dbs", isDefault: false, canHide: true },
  [ColumnId.dbsKills]: { label: "DBS Kills", shortLabel: "DBS-K", group: "kills-dbs", isDefault: false, canHide: true },
  [ColumnId.dbsReturns]: { label: "DBS Returns", shortLabel: "DBS-R", group: "kills-dbs", isDefault: false, canHide: true },

  // Kills - Backstab
  [ColumnId.bsCombined]: { label: "Backstab Combined", shortLabel: "BS", group: "kills-bs", isDefault: true, canHide: true },
  [ColumnId.bsAttempts]: { label: "Backstab Attempts", shortLabel: "BS-A", group: "kills-bs", isDefault: false, canHide: true },
  [ColumnId.bsKills]: { label: "Backstab Kills", shortLabel: "BS-K", group: "kills-bs", isDefault: false, canHide: true },
  [ColumnId.bsReturns]: { label: "Backstab Returns", shortLabel: "BS-R", group: "kills-bs", isDefault: false, canHide: true },

  // Kills - DFA
  [ColumnId.dfaCombined]: { label: "DFA Combined", shortLabel: "DFA", group: "kills-dfa", isDefault: true, canHide: true },
  [ColumnId.dfaAttempts]: { label: "DFA Attempts", shortLabel: "DFA-A", group: "kills-dfa", isDefault: false, canHide: true },
  [ColumnId.dfaKills]: { label: "DFA Kills", shortLabel: "DFA-K", group: "kills-dfa", isDefault: false, canHide: true },
  [ColumnId.dfaReturns]: { label: "DFA Returns", shortLabel: "DFA-R", group: "kills-dfa", isDefault: false, canHide: true },

  // Kills - YDFA
  [ColumnId.ydfaCombined]: { label: "YDFA Combined", shortLabel: "YDFA", group: "kills-ydfa", isDefault: true, canHide: true },
  [ColumnId.ydfaAttempts]: { label: "YDFA Attempts", shortLabel: "YDFA-A", group: "kills-ydfa", isDefault: false, canHide: true },
  [ColumnId.ydfaKills]: { label: "YDFA Kills", shortLabel: "YDFA-K", group: "kills-ydfa", isDefault: false, canHide: true },
  [ColumnId.ydfaReturns]: { label: "YDFA Returns", shortLabel: "YDFA-R", group: "kills-ydfa", isDefault: false, canHide: true },

  // Kills - Blue Backstab
  [ColumnId.blubsCombined]: { label: "Blue Backstab Combined", shortLabel: "BBS", group: "kills-blubs", isDefault: true, canHide: true },
  [ColumnId.blubsAttempts]: { label: "Blue Backstab Attempts", shortLabel: "BBS-A", group: "kills-blubs", isDefault: false, canHide: true },
  [ColumnId.blubsKills]: { label: "Blue Backstab Kills", shortLabel: "BBS-K", group: "kills-blubs", isDefault: false, canHide: true },
  [ColumnId.blubsReturns]: { label: "Blue Backstab Returns", shortLabel: "BBS-R", group: "kills-blubs", isDefault: false, canHide: true },

  // Kills - Uppercut
  [ColumnId.upcutCombined]: { label: "Uppercut Combined", shortLabel: "Upc", group: "kills-upcut", isDefault: true, canHide: true },
  [ColumnId.upcutKills]: { label: "Uppercut Kills", shortLabel: "Upc-K", group: "kills-upcut", isDefault: false, canHide: true },
  [ColumnId.upcutReturns]: { label: "Uppercut Returns", shortLabel: "Upc-R", group: "kills-upcut", isDefault: false, canHide: true },

  // Kills - Red Stance
  [ColumnId.redCombined]: { label: "Red Stance Combined", shortLabel: "Red", group: "kills-red", isDefault: true, canHide: true },
  [ColumnId.redKills]: { label: "Red Stance Kills", shortLabel: "Red-K", group: "kills-red", isDefault: false, canHide: true },
  [ColumnId.redReturns]: { label: "Red Stance Returns", shortLabel: "Red-R", group: "kills-red", isDefault: false, canHide: true },

  // Kills - Yellow Stance
  [ColumnId.yelCombined]: { label: "Yellow Stance Combined", shortLabel: "Yel", group: "kills-yel", isDefault: true, canHide: true },
  [ColumnId.yelKills]: { label: "Yellow Stance Kills", shortLabel: "Yel-K", group: "kills-yel", isDefault: false, canHide: true },
  [ColumnId.yelReturns]: { label: "Yellow Stance Returns", shortLabel: "Yel-R", group: "kills-yel", isDefault: false, canHide: true },

  // Kills - Blue Stance
  [ColumnId.bluCombined]: { label: "Blue Stance Combined", shortLabel: "Blu", group: "kills-blu", isDefault: true, canHide: true },
  [ColumnId.bluKills]: { label: "Blue Stance Kills", shortLabel: "Blu-K", group: "kills-blu", isDefault: false, canHide: true },
  [ColumnId.bluReturns]: { label: "Blue Stance Returns", shortLabel: "Blu-R", group: "kills-blu", isDefault: false, canHide: true },

  // Kills - Idle
  [ColumnId.idleCombined]: { label: "Idle Combined", shortLabel: "Idle", group: "kills-idle", isDefault: true, canHide: true },
  [ColumnId.idleKills]: { label: "Idle Kills", shortLabel: "Idle-K", group: "kills-idle", isDefault: false, canHide: true },
  [ColumnId.idleReturns]: { label: "Idle Returns", shortLabel: "Idle-R", group: "kills-idle", isDefault: false, canHide: true },

  // Kills - Mine
  [ColumnId.mineCombined]: { label: "Mine Combined", shortLabel: "Mine", group: "kills-mine", isDefault: true, canHide: true },
  [ColumnId.mineKills]: { label: "Mine Kills", shortLabel: "Mine-K", group: "kills-mine", isDefault: false, canHide: true },
  [ColumnId.mineReturns]: { label: "Mine Returns", shortLabel: "Mine-R", group: "kills-mine", isDefault: false, canHide: true },

  // Kills - Turret
  [ColumnId.turCombined]: { label: "Turret Combined", shortLabel: "Tur", group: "kills-tur", isDefault: true, canHide: true },
  [ColumnId.turKills]: { label: "Turret Kills", shortLabel: "Tur-K", group: "kills-tur", isDefault: false, canHide: true },
  [ColumnId.turReturns]: { label: "Turret Returns", shortLabel: "Tur-R", group: "kills-tur", isDefault: false, canHide: true },

  // Kills - Unknown
  [ColumnId.unknCombined]: { label: "Unknown Combined", shortLabel: "Unk", group: "kills-unkn", isDefault: false, canHide: true },
  [ColumnId.unknKills]: { label: "Unknown Kills", shortLabel: "Unk-K", group: "kills-unkn", isDefault: false, canHide: true },
  [ColumnId.unknReturns]: { label: "Unknown Returns", shortLabel: "Unk-R", group: "kills-unkn", isDefault: false, canHide: true },
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
// Supports nested groups via "parent-child" naming (e.g., "kills-dfa" becomes a subgroup of "Kills")
export interface ColumnGroupItem {
  label: string;
  columns: ColumnId[];
  subgroups?: ColumnGroupItem[];
}

export const columnGroups = Object.entries(columnConfig).reduce<ColumnGroupItem[]>(
  (groups, [key, config]) => {
    if (config.group === "fixed" || !config.canHide) return groups;

    const groupKey = config.group;
    const isSubgroup = groupKey.includes("-");

    if (isSubgroup) {
      const [parentKey] = groupKey.split("-") as [string];
      const parentLabel = parentKey.charAt(0).toUpperCase() + parentKey.slice(1);
      const subgroupLabel = columnGroupLabels[groupKey];

      let parentGroup = groups.find((group) => group.label === parentLabel);
      if (!parentGroup) {
        parentGroup = { label: parentLabel, columns: [], subgroups: [] };
        groups.push(parentGroup);
      }

      let subgroup = parentGroup.subgroups?.find((subgroup) => subgroup.label === subgroupLabel);
      if (!subgroup) {
        subgroup = { label: subgroupLabel, columns: [] };
        parentGroup.subgroups = parentGroup.subgroups || [];
        parentGroup.subgroups.push(subgroup);
      }
      subgroup.columns.push(key as ColumnId);
    } else {
      const label = columnGroupLabels[groupKey];
      const existingGroup = groups.find((group) => group.label === label);
      if (existingGroup) {
        existingGroup.columns.push(key as ColumnId);
      } else {
        groups.push({ label, columns: [key as ColumnId] });
      }
    }

    return groups;
  },
  [],
);
