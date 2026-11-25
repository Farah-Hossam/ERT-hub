import { CalendarDays } from "lucide-react";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TeamBadge } from "@/components/shared/TeamBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Task } from "../types/task.types";
import { formatAssignees, formatDueDate, formatTaskId, isOverdue } from "../utils";
interface TaskCardProps {
  task: Task;
  onOpen?: () => void;
}

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const overdue = isOverdue(task);
  const progressVariant =
    task.status === "completed" ? "success" : overdue ? "danger" : "brand";

  return (
    <Card
      interactive={!!onOpen}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (onOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen();
        }
      }}
      className="flex flex-col gap-4"
      // A colored edge shows which team the task belongs to
      style={task.team ? { borderLeftColor: task.team.color, borderLeftWidth: 4 } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">{formatTaskId(task.task_number)}</p>
          <h2 className="font-semibold leading-snug">{task.title}</h2>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {task.team && <TeamBadge team={task.team} />}
        <PriorityBadge priority={task.priority} />
        {overdue && <Badge variant="danger">Overdue</Badge>}
      </div>

      <ProgressBar value={task.progress} variant={progressVariant} />

      <div className="flex items-center justify-between gap-3 text-xs text-muted">
        <span className="truncate">{formatAssignees(task.assignees)}</span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={14} />
          {formatDueDate(task.due_date)}
        </span>
      </div>
    </Card>
  );
}
