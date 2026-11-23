import { Badge } from "@/components/ui/Badge";
import { taskPriorities } from "@/config/task-status";
import type { TaskPriority } from "@/features/tasks/types/task.types";

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { label, variant } = taskPriorities[priority];
  return <Badge variant={variant}>{label}</Badge>;
}
