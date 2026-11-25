import type { Task, TaskPriority } from "@/features/tasks/types/task.types";
import { isOverdue } from "@/features/tasks/utils";

const DAY_MS = 24 * 60 * 60 * 1000;
const DUE_SOON_DAYS = 7;

export type DashboardScope = "mine" | "team";

export interface DashboardStat {
  label: string;
  value: number;
  tone: "neutral" | "success" | "danger" | "warning";
}

// Whole days from today until a "YYYY-MM-DD" date (negative = in the past)
export function daysUntil(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

function isDueSoon(task: Task): boolean {
  if (!task.due_date || task.status === "completed") return false;
  const days = daysUntil(task.due_date);
  return days >= 0 && days <= DUE_SOON_DAYS;
}

export function getStats(
  tasks: Task[],
  userId: string,
  scope: DashboardScope
): DashboardStat[] {
  if (scope === "team") {
    return [
      { label: "Total tasks", value: tasks.length, tone: "neutral" },
      { label: "Completed", value: tasks.filter((t) => t.status === "completed").length, tone: "success" },
      { label: "Overdue", value: tasks.filter(isOverdue).length, tone: "danger" },
      { label: "Blocked", value: tasks.filter((t) => t.status === "blocked").length, tone: "danger" },
    ];
  }

  const mine = tasks.filter((t) => t.assignees.some((a) => a.id === userId));
  return [
    { label: "My open tasks", value: mine.filter((t) => t.status !== "completed").length, tone: "neutral" },
    { label: "Completed", value: mine.filter((t) => t.status === "completed").length, tone: "success" },
    { label: "Overdue", value: mine.filter(isOverdue).length, tone: "danger" },
    { label: "Due this week", value: mine.filter(isDueSoon).length, tone: "warning" },
  ];
}

const priorityRank: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// 0 = overdue, 1 = due soon, 2 = everything else
function urgencyRank(task: Task): number {
  if (isOverdue(task)) return 0;
  if (isDueSoon(task)) return 1;
  return 2;
}

function compareByDueDate(a: Task, b: Task): number {
  if (a.due_date === b.due_date) return 0;
  if (!a.due_date) return 1;
  if (!b.due_date) return -1;
  return a.due_date.localeCompare(b.due_date);
}

// My open tasks: overdue first, then due soon, then by priority and deadline
export function getMyTasks(tasks: Task[], userId: string, limit = 5): Task[] {
  return tasks
    .filter((t) => t.assignee_id === userId && t.status !== "completed")
    .sort(
      (a, b) =>
        urgencyRank(a) - urgencyRank(b) ||
        priorityRank[a.priority] - priorityRank[b.priority] ||
        compareByDueDate(a, b)
    )
    .slice(0, limit);
}

// Open tasks with a deadline today or later, soonest first
export function getUpcomingDeadlines(tasks: Task[], limit = 5): Task[] {
  return tasks
    .filter(
      (t) =>
        t.status !== "completed" && t.due_date && daysUntil(t.due_date) >= 0
    )
    .sort(compareByDueDate)
    .slice(0, limit);
}

// Blocked or overdue tasks that need someone's attention
export function getNeedsAttention(tasks: Task[], limit = 5): Task[] {
  return tasks
    .filter((t) => t.status === "blocked" || isOverdue(t))
    .sort(
      (a, b) =>
        urgencyRank(a) - urgencyRank(b) ||
        priorityRank[a.priority] - priorityRank[b.priority]
    )
    .slice(0, limit);
}

export function getDueLabel(task: Task): {
  text: string;
  tone: "danger" | "warning" | "muted";
} {
  if (task.status === "completed") return { text: "Completed", tone: "muted" };
  if (!task.due_date) return { text: "No deadline", tone: "muted" };

  const days = daysUntil(task.due_date);
  if (days < 0) {
    const n = Math.abs(days);
    return { text: `Overdue by ${n} day${n === 1 ? "" : "s"}`, tone: "danger" };
  }
  if (days === 0) return { text: "Due today", tone: "warning" };
  if (days === 1) return { text: "Due tomorrow", tone: "warning" };
  return {
    text: `Due in ${days} days`,
    tone: days <= DUE_SOON_DAYS ? "warning" : "muted",
  };
}
