import { format, formatDistanceStrict, subDays } from "date-fns";

/**
 * Format a duration in milliseconds to a compact string (e.g., "1h 2m 30s" or "45s")
 */
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

/**
 * Format a period in days to a human-readable relative label using date-fns
 */
export function formatPeriod(days: number, relative: "this" | "previous" = "this"): string {
  const prefix = relative === "this" ? "this" : "previous";

  // Use date-fns for human-readable period
  const distance = formatDistanceStrict(subDays(new Date(), days), new Date(), { unit: days >= 365 ? "year" : days >= 28 ? "month" : "day" });

  // Map to semantic labels
  if (days === 7) return `${prefix} week`;
  if (days === 30 || days === 31) return `${prefix} month`;
  if (days === 365 || days === 366) return `${prefix} year`;

  return `${relative === "this" ? "last" : "previous"} ${distance}`;
}

/**
 * Format a date to a human-readable string
 */
export function formatDate(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return format(date, "yyyy.MM.dd HH:mm");
}
