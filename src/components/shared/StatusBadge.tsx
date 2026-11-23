import { Badge } from "@/components/ui/Badge";
import { taskStatuses } from "@/config/task-status";
import type { TaskStatus } from "@/features/tasks/types/task.types";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, variant } = taskStatuses[status];
  return <Badge variant={variant}>{label}</Badge>;
}
