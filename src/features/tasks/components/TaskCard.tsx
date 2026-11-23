import { CalendarDays } from "lucide-react";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Task } from "../types/task.types";
import { formatDueDate, formatTaskId, isOverdue } from "../utils";

export function TaskCard({ task }: { task: Task }) {
  const overdue = isOverdue(task);
  const progressVariant =
    task.status === "completed" ? "success" : overdue ? "danger" : "brand";

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">{formatTaskId(task.task_number)}</p>
          <h2 className="font-semibold leading-snug">{task.title}</h2>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {overdue && <Badge variant="danger">Overdue</Badge>}
      </div>

      <ProgressBar value={task.progress} variant={progressVariant} />

      <div className="flex items-center justify-between gap-3 text-xs text-muted">
        <span>
          {task.assignee ? task.assignee.full_name || "Unnamed" : "Unassigned"}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={14} />
          {formatDueDate(task.due_date)}
        </span>
      </div>
    </Card>
  );
}
