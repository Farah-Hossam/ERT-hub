import { createClient } from "@/lib/supabase/client";
import type {
  Task,
  TaskFormData,
  TaskMember,
  TaskStatus,
} from "../types/task.types";

// Fetch each task together with its assignee's name
const TASK_SELECT = "*, assignee:profiles!assignee_id(id, full_name)";

export async function getTasks(): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Task[];
}

export async function createTask(input: TaskFormData): Promise<void> {
  const supabase = createClient();
  // created_by is filled in by the database from the logged-in user
  const { error } = await supabase.from("tasks").insert({
    title: input.title.trim(),
    description: input.description.trim() || null,
    priority: input.priority,
    assignee_id: input.assignee_id || null,
    start_date: input.start_date || null,
    due_date: input.due_date || null,
  });

  if (error) throw new Error(error.message);
}

export async function updateTaskProgress(
  id: string,
  changes: { status: TaskStatus; progress: number }
): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: changes.status, progress: changes.progress })
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  // When the security rules block an update, Supabase returns no rows
  // instead of an error, so we check for that ourselves.
  if (!data || data.length === 0) {
    throw new Error("You don't have permission to change this task");
  }
}

export async function getAssignableMembers(): Promise<TaskMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("is_active", true)
    .order("full_name");

  if (error) throw new Error(error.message);
  return (data ?? []) as TaskMember[];
}
