export type CalendarItemKind = "task" | "event";

// Anything that can appear on the calendar: a task deadline or an event
export interface CalendarItem {
  id: string;
  kind: CalendarItemKind;
  title: string;
  dateKey: string; // "YYYY-MM-DD"
  timeLabel: string | null;
  subtitle: string | null;
  overdue: boolean;
  done: boolean;
}
