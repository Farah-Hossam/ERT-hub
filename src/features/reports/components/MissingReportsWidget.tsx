import { Card } from "@/components/ui/Card";
import type { TeamEvent } from "@/features/events/types/event.types";
import type { Task } from "@/features/tasks/types/task.types";
import { buildReportSnapshot } from "../snapshot";
import type { ActiveMember, Report } from "../types/report.types";

interface MissingReportsWidgetProps {
  members: ActiveMember[];
  weekReports: Report[]; // the submitted reports for the chosen week
  weekStart: string;
  isCurrentWeek: boolean;
  tasks: Task[];
  events: TeamEvent[];
}

// Who has not submitted a report for the chosen week. For the current week we
// also show where their tasks stand right now, taken live from the task list.
export function MissingReportsWidget({
  members,
  weekReports,
  weekStart,
  isCurrentWeek,
  tasks,
  events,
}: MissingReportsWidgetProps) {
  const submittedIds = new Set(weekReports.map((r) => r.author_id));
  const missing = members.filter((m) => !submittedIds.has(m.id));

  function liveStatus(memberId: string): string {
    const live = buildReportSnapshot({
      tasks,
      events,
      userId: memberId,
      weekStart,
      previous: null,
    });
    if (live.completion === null) return "No tasks assigned";
    const parts = [`${live.completion}% complete`];
    if (live.counts.overdue > 0) parts.push(`${live.counts.overdue} overdue`);
    if (live.counts.blocked > 0) parts.push(`${live.counts.blocked} blocked`);
    return parts.join(", ");
  }

  return (
    <Card>
      <h2 className="mb-2 font-semibold">Missing reports</h2>
      {members.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">Loading...</p>
      ) : missing.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">
          Everyone has submitted this week.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {missing.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>{m.full_name || m.email || "Unnamed"}</span>
              {isCurrentWeek && (
                <span className="text-xs text-muted">{liveStatus(m.id)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
