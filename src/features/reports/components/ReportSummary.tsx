import type { ReactNode } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { eventTypes } from "@/config/event-types";
import { formatEventWhen } from "@/features/events/utils";
import { formatDueDate, formatTaskId } from "@/features/tasks/utils";
import { cn } from "@/lib/utils";
import type { ReportSnapshot, SnapshotTask } from "../types/report.types";

interface ReportSummaryProps {
  snapshot: ReportSnapshot;
  // Optional extra content under each task (a note, or a note box)
  renderTaskExtra?: (task: SnapshotTask) => ReactNode;
}

function Stat({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="rounded-lg bg-surface-secondary/60 px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className={cn("text-xl font-bold", alert && value > 0 && "text-red-600 dark:text-red-400")}>
        {value}
      </p>
    </div>
  );
}

function dueText(task: SnapshotTask): { text: string; alert: boolean } {
  if (task.status === "completed") return { text: "Completed", alert: false };
  if (!task.due_date) return { text: "No deadline", alert: false };
  if (task.overdue) return { text: `Overdue, was due ${formatDueDate(task.due_date)}`, alert: true };
  return { text: `Due ${formatDueDate(task.due_date)}`, alert: false };
}

// The automatic part of a report. Used while writing and when reading.
export function ReportSummary({ snapshot, renderTaskExtra }: ReportSummaryProps) {
  const tasks = snapshot.tasks ?? [];
  const events = snapshot.events ?? [];
  const counts = snapshot.counts;
  const generatedAt = new Date(snapshot.generated_at).getTime();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <p className="text-sm font-medium">Overall completion</p>
          <p className="text-2xl font-bold">
            {snapshot.completion === null ? "-" : `${snapshot.completion}%`}
          </p>
        </div>
        {snapshot.completion === null ? (
          <p className="text-sm text-muted">No tasks were assigned this week.</p>
        ) : (
          <ProgressBar value={snapshot.completion} showPercentage={false} />
        )}
      </div>

      {counts && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Completed this week" value={counts.completed_this_week} />
          <Stat label="In progress" value={counts.in_progress} />
          <Stat label="Blocked" value={counts.blocked} alert />
          <Stat label="Overdue" value={counts.overdue} alert />
        </div>
      )}

      {tasks.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Tasks</p>
          <ul className="mt-1 divide-y divide-border">
            {tasks.map((task) => {
              const due = dueText(task);
              const delta =
                task.previous_progress === null ? 0 : task.progress - task.previous_progress;
              return (
                <li key={task.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted">{formatTaskId(task.task_number)}</p>
                      <p className="text-sm font-medium">{task.title}</p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <ProgressBar
                      value={task.progress}
                      showPercentage={false}
                      variant={task.status === "completed" ? "success" : task.overdue ? "danger" : "brand"}
                      className="flex-1"
                    />
                    <span className="w-24 text-right text-xs font-medium">
                      {task.progress}%
                      {delta !== 0 && (
                        <span
                          className={cn(
                            "ml-1",
                            delta > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      )}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      due.alert ? "font-medium text-red-600 dark:text-red-400" : "text-muted"
                    )}
                  >
                    {due.text}
                  </p>
                  {renderTaskExtra?.(task)}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {events.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Events</p>
          <ul className="mt-1 divide-y divide-border">
            {events.map((event) => {
              const type = eventTypes[event.type];
              const past = new Date(event.start_at).getTime() < generatedAt;
              return (
                <li key={event.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted">
                      {formatEventWhen(event.start_at, null)}
                      {past ? ", this week" : ", coming up"}
                    </p>
                  </div>
                  <Badge variant={type.variant}>{type.label}</Badge>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
