import { toDateKey } from "@/lib/dates";
import type { TeamEvent } from "./types/event.types";

const shortDate: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
};

function time(date: Date): string {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function formatEventTime(start: string): string {
  return time(new Date(start));
}

export function formatEventWhen(start: string, end: string | null): string {
  const s = new Date(start);
  const date = s.toLocaleDateString("en-GB", shortDate);
  if (!end) return `${date}, ${time(s)}`;

  const e = new Date(end);
  if (toDateKey(s) === toDateKey(e)) {
    return `${date}, ${time(s)} - ${time(e)}`;
  }
  return `${date}, ${time(s)} to ${e.toLocaleDateString("en-GB", shortDate)}, ${time(e)}`;
}

// An event counts as upcoming until it ends. Without an end time it stays
// upcoming for the whole day it starts.
export function isUpcoming(event: Pick<TeamEvent, "start_at" | "end_at">): boolean {
  if (event.end_at) return new Date(event.end_at).getTime() >= Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return new Date(event.start_at).getTime() >= startOfToday.getTime();
}
