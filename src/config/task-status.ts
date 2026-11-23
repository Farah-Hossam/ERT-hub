import type {
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types/task.types";

export type BadgeVariant =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

export const taskStatuses: Record<
  TaskStatus,
  { label: string; description: string; variant: BadgeVariant }
> = {
  backlog: { label: "Backlog", description: "Not yet planned for execution", variant: "neutral" },
  todo: { label: "To Do", description: "Ready to be started", variant: "neutral" },
  in_progress: { label: "In Progress", description: "Currently being worked on", variant: "info" },
  under_review: { label: "Under Review", description: "Awaiting review", variant: "warning" },
  completed: { label: "Completed", description: "Finished", variant: "success" },
  blocked: { label: "Blocked", description: "Cannot proceed", variant: "danger" },
};

export const taskPriorities: Record<
  TaskPriority,
  { label: string; variant: BadgeVariant }
> = {
  low: { label: "Low", variant: "neutral" },
  medium: { label: "Medium", variant: "info" },
  high: { label: "High", variant: "warning" },
  urgent: { label: "Urgent", variant: "danger" },
};
