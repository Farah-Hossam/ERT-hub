import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/Card";
import type { Task } from "@/features/tasks/types/task.types";
import { formatAssignees, formatTaskId } from "@/features/tasks/utils";
import { cn } from "@/lib/utils";
import { getDueLabel } from "../utils";

const dueTone = {
  danger: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  muted: "text-muted",
};

interface TaskListWidgetProps {
  title: string;
  tasks: Task[];
  emptyText: string;
  loading?: boolean;
  className?: string;
}

// A short list of tasks, used for "My tasks", "Upcoming deadlines"
// and "Needs attention"
export function TaskListWidget({
  title,
  tasks,
  emptyText,
  loading,
  className,
}: TaskListWidgetProps) {
  return (
    <Card className={className}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link href="/tasks" className="text-sm font-medium text-brand hover:underline">
          View all
        </Link>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-muted">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-border">
          {tasks.map((task) => {
            const due = getDueLabel(task);
            return (
              <li key={task.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted">{formatTaskId(task.task_number)}</p>
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="truncate text-xs text-muted">
                    {formatAssignees(task.assignees)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={task.status} />
                  <span className={cn("text-xs font-medium", dueTone[due.tone])}>
                    {due.text}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
