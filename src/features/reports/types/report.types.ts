import type { EventType } from "@/features/events/types/event.types";
import type {
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types/task.types";

export type ReportStatus = "draft" | "submitted" | "reviewed";

// ---- The automatic part of a report -------------------------------------

export interface SnapshotTask {
  id: string;
  task_number: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  due_date: string | null;
  overdue: boolean;
  // Progress at the member's previous report, or null if there was none
  previous_progress: number | null;
}

export interface SnapshotEvent {
  id: string;
  title: string;
  type: EventType;
  start_at: string;
}

// Everything the system works out by itself when a report is saved
export interface ReportSnapshot {
  generated_at: string;
  // Average progress of the member's tasks for the week, or null if none
  completion: number | null;
  counts: {
    total: number;
    completed_this_week: number;
    in_progress: number;
    blocked: number;
    overdue: number;
  };
  tasks: SnapshotTask[];
  events: SnapshotEvent[];
}

// ---- Reports -------------------------------------------------------------

export interface ReportTaskUpdate {
  id: string;
  task_id: string;
  note: string;
  task: { task_number: number; title: string } | null;
}

export interface Report {
  id: string;
  author_id: string;
  week_start: string; // "YYYY-MM-DD", the first day of the reporting week
  // The text fields below are all optional notes written by the member.
  // "accomplished" is shown as "Notes and highlights".
  accomplished: string;
  challenges: string;
  blockers: string;
  help_needed: string;
  next_week: string;
  status: ReportStatus;
  submitted_at: string | null;
  reviewer_id: string | null;
  review_feedback: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  snapshot: ReportSnapshot | null; // null for reports saved before summaries existed
  author: { id: string; full_name: string; email: string | null } | null;
  task_updates: ReportTaskUpdate[];
}

// What the report form collects.
// task_notes maps a task id to the member's optional note about that task.
export interface ReportFormData {
  accomplished: string;
  challenges: string;
  blockers: string;
  help_needed: string;
  next_week: string;
  task_notes: Record<string, string>;
}

export interface ActiveMember {
  id: string;
  full_name: string;
  email: string | null;
  team_ids: string[]; // the teams this person belongs to
}
