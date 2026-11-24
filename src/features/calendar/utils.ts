import { WEEK_STARTS_ON } from "@/config/constants";
import { eventTypes } from "@/config/event-types";
import { formatEventTime } from "@/features/events/utils";
import type { TeamEvent } from "@/features/events/types/event.types";
import type { Task } from "@/features/tasks/types/task.types";
import { formatTaskId, isOverdue } from "@/features/tasks/utils";
import { addDays, startOfWeek, toDateKey } from "@/lib/dates";
import type { CalendarItem } from "./types/calendar.types";

// Task deadlines and events come from their own pages' data.
// The calendar never keeps a separate copy of them.
export function buildCalendarItems(tasks: Task[], events: TeamEvent[]): CalendarItem[] {
  const items: CalendarItem[] = [];

  for (const task of tasks) {
    if (!task.due_date) continue;
    items.push({
      id: `task-${task.id}`,
      kind: "task",
      title: `${formatTaskId(task.task_number)} ${task.title}`,
      dateKey: task.due_date,
      timeLabel: null,
      subtitle: task.assignee ? task.assignee.full_name || "Unnamed" : "Unassigned",
      overdue: isOverdue(task),
      done: task.status === "completed",
    });
  }

  for (const event of events) {
    items.push({
      id: `event-${event.id}`,
      kind: "event",
      title: event.title,
      dateKey: toDateKey(new Date(event.start_at)),
      timeLabel: formatEventTime(event.start_at),
      subtitle: event.location || eventTypes[event.type].label,
      overdue: false,
      done: false,
    });
  }

  // By day, then events (which have a time) before task deadlines
  return items.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    if (a.timeLabel && b.timeLabel) return a.timeLabel.localeCompare(b.timeLabel);
    if (a.timeLabel) return -1;
    if (b.timeLabel) return 1;
    return a.title.localeCompare(b.title);
  });
}

export function groupByDate(items: CalendarItem[]): Map<string, CalendarItem[]> {
  const groups = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const list = groups.get(item.dateKey);
    if (list) list.push(item);
    else groups.set(item.dateKey, [item]);
  }
  return groups;
}

// The 42 days (6 weeks) shown for a month, starting on the first day of the week
export function getMonthGrid(monthStart: Date): Date[] {
  const first = startOfWeek(monthStart, WEEK_STARTS_ON);
  return Array.from({ length: 42 }, (_, i) => addDays(first, i));
}
