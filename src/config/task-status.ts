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

// autoProgress: the progress a task jumps to when it is moved to this status.
// null means "keep the current progress" (a blocked task stays where it is).
// Change these numbers to match how ERT wants to measure progress.
export const taskStatuses: Record<
  TaskStatus,
  {
    label: string;
    description: string;
    variant: BadgeVariant;
    autoProgress: number | null;
  }
> = {
  backlog: { label: "Backlog", description: "Not yet planned for execution", variant: "neutral", autoProgress: 0 },
  todo: { label: "To Do", description: "Ready to be started", variant: "neutral", autoProgress: 0 },
  in_progress: { label: "In Progress", description: "Currently being worked on", variant: "info", autoProgress: 50 },
  under_review: { label: "Under Review", description: "Awaiting review", variant: "warning", autoProgress: 90 },
  completed: { label: "Completed", description: "Finished", variant: "success", autoProgress: 100 },
  blocked: { label: "Blocked", description: "Cannot proceed", variant: "danger", autoProgress: null },
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
