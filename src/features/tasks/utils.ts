import type { Task } from "./types/task.types";

export function formatTaskId(taskNumber: number) {
  return `ERT-${String(taskNumber).padStart(3, "0")}`;
}

export function isOverdue(task: Pick<Task, "due_date" | "status">) {
  if (!task.due_date || task.status === "completed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.due_date + "T00:00:00") < today;
}

export function formatDueDate(date: string | null) {
  if (!date) return "No deadline";
  return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
