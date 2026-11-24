import { WEEK_STARTS_ON } from "@/config/constants";
import { addDays, parseDateKey, startOfWeek, toDateKey } from "@/lib/dates";
import type { Report } from "./types/report.types";

// "YYYY-MM-DD" of the first day of the current reporting week
export function currentWeekStart(): string {
  return toDateKey(startOfWeek(new Date(), WEEK_STARTS_ON));
}

export function shiftWeek(weekStart: string, weeks: number): string {
  return toDateKey(addDays(parseDateKey(weekStart), weeks * 7));
}

export function formatWeekRange(weekStart: string): string {
  const start = parseDateKey(weekStart);
  const end = addDays(start, 6);
  const short = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${short(start)} - ${short(end)} ${end.getFullYear()}`;
}

// A report is late if it was submitted after its week ended,
// or is still a draft once the week is over.
export function isLate(
  report: Pick<Report, "status" | "submitted_at" | "week_start">
): boolean {
  const weekEnd = toDateKey(addDays(parseDateKey(report.week_start), 6));
  if (report.submitted_at) {
    return toDateKey(new Date(report.submitted_at)) > weekEnd;
  }
  return report.status === "draft" && toDateKey(new Date()) > weekEnd;
}

export function authorName(report: Pick<Report, "author">): string {
  return report.author?.full_name || report.author?.email || "Unknown";
}
