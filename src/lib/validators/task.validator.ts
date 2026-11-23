import type { TaskFormData } from "@/features/tasks/types/task.types";

export type TaskFormErrors = Partial<Record<keyof TaskFormData, string>>;

export function validateTaskForm(data: TaskFormData): TaskFormErrors {
  const errors: TaskFormErrors = {};

  const title = data.title.trim();
  if (!title) {
    errors.title = "Give the task a title";
  } else if (title.length > 120) {
    errors.title = "Keep the title under 120 characters";
  }

  // Dates are "YYYY-MM-DD" text, so comparing them as text works
  if (data.start_date && data.due_date && data.due_date < data.start_date) {
    errors.due_date = "The deadline can't be before the start date";
  }

  return errors;
}
