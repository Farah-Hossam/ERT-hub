import type { DashboardStat } from "@/features/dashboard/utils";
import type { TeamEvent } from "@/features/events/types/event.types";
import type { Task } from "@/features/tasks/types/task.types";
import { isOverdue } from "@/features/tasks/utils";
import { addDays, parseDateKey, toDateKey } from "@/lib/dates";
import type {
  Report,
  ReportSnapshot,
  SnapshotTask,
} from "./types/report.types";

const EVENT_LOOKAHEAD_DAYS = 14;
const MAX_EVENTS = 10;

interface BuildSnapshotInput {
  tasks: Task[]; // every task the person can see
  events: TeamEvent[];
  userId: string; // whose report this is
  weekStart: string; // "YYYY-MM-DD"
  previous: ReportSnapshot | null; // the person's previous report, if any
  now?: Date;
}

// Works out the automatic part of a report from the member's tasks and the
// team's events. A task counts for the week if it is still open, or was
// completed during the week.
export function buildReportSnapshot({
  tasks,
  events,
  userId,
  weekStart,
  previous,
  now = new Date(),
}: BuildSnapshotInput): ReportSnapshot {
  const weekEnd = toDateKey(addDays(parseDateKey(weekStart), 6));
  const previousProgress = new Map(
    (previous?.tasks ?? []).map((t) => [t.id, t.progress])
  );

  const relevant = tasks
    .filter((t) => t.assignee_id === userId)
    .filter((t) => {
      if (t.status !== "completed") return true;
      const finished = toDateKey(new Date(t.updated_at));
      return finished >= weekStart && finished <= weekEnd;
    });

  const snapshotTasks: SnapshotTask[] = relevant
    .map((t) => ({
      id: t.id,
      task_number: t.task_number,
      title: t.title,
      status: t.status,
      priority: t.priority,
      progress: t.progress,
      due_date: t.due_date,
      overdue: isOverdue(t),
      previous_progress: previousProgress.get(t.id) ?? null,
    }))
    .sort((a, b) => {
      // Overdue first, then blocked, then by deadline
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      const aBlocked = a.status === "blocked";
      const bBlocked = b.status === "blocked";
      if (aBlocked !== bBlocked) return aBlocked ? -1 : 1;
      if (a.due_date !== b.due_date) {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      }
      return a.task_number - b.task_number;
    });

  const lastEventDay = toDateKey(addDays(now, EVENT_LOOKAHEAD_DAYS));
  const snapshotEvents = events
    .filter((e) => {
      const day = toDateKey(new Date(e.start_at));
      return day >= weekStart && day <= lastEventDay;
    })
    .sort((a, b) => a.start_at.localeCompare(b.start_at))
    .slice(0, MAX_EVENTS)
    .map((e) => ({ id: e.id, title: e.title, type: e.type, start_at: e.start_at }));

  const completion =
    snapshotTasks.length === 0
      ? null
      : Math.round(
          snapshotTasks.reduce((sum, t) => sum + t.progress, 0) /
            snapshotTasks.length
        );

  return {
    generated_at: now.toISOString(),
    completion,
    counts: {
      total: snapshotTasks.length,
      completed_this_week: snapshotTasks.filter((t) => t.status === "completed").length,
      in_progress: snapshotTasks.filter((t) => t.status === "in_progress").length,
      blocked: snapshotTasks.filter((t) => t.status === "blocked").length,
      overdue: snapshotTasks.filter((t) => t.overdue).length,
    },
    tasks: snapshotTasks,
    events: snapshotEvents,
  };
}

// Team-wide numbers for one week, added up from the submitted reports
export function getTeamStats(
  weekReports: Report[],
  memberCount: number
): DashboardStat[] {
  const snapshots = weekReports.flatMap((r) => (r.snapshot ? [r.snapshot] : []));
  const completions = snapshots.flatMap((s) =>
    s.completion === null ? [] : [s.completion]
  );
  const average =
    completions.length === 0
      ? 0
      : Math.round(completions.reduce((a, b) => a + b, 0) / completions.length);

  return [
    {
      label: memberCount > 0 ? `Submitted (of ${memberCount})` : "Submitted",
      value: weekReports.length,
      tone: "neutral",
    },
    { label: "Average completion %", value: average, tone: "neutral" },
    {
      label: "Overdue tasks",
      value: snapshots.reduce((sum, s) => sum + (s.counts?.overdue ?? 0), 0),
      tone: "danger",
    },
    {
      label: "Blocked tasks",
      value: snapshots.reduce((sum, s) => sum + (s.counts?.blocked ?? 0), 0),
      tone: "danger",
    },
  ];
}
