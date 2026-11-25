"use client";

import { useState } from "react";
import { CalendarDays, User } from "lucide-react";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TeamBadge } from "@/components/shared/TeamBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Select } from "@/components/ui/Select";
import { taskStatuses } from "@/config/task-status";
import type { Task, TaskStatus } from "../types/task.types";
import { formatDueDate, isOverdue } from "../utils";
import { TaskProgress } from "./TaskProgress";

const statusOptions = Object.entries(taskStatuses).map(([value, { label }]) => ({
  value,
  label,
}));

interface TaskDetailsProps {
  task: Task;
  canEdit: boolean;
  onSave: (changes: { status: TaskStatus; progress: number }) => Promise<void>;
    onClose: () => void;
  canDelete?: boolean;
  onDelete?: () => Promise<void>;
}

export function TaskDetails({ task, canEdit, onSave, onClose, canDelete, onDelete }: TaskDetailsProps) {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [progress, setProgress] = useState(task.progress);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const changed = status !== task.status || progress !== task.progress;
  const overdue = isOverdue(task);

  function handleStatusChange(next: TaskStatus) {
    setStatus(next);
    // Each status moves the progress bar to its own value
    // (see autoProgress in config/task-status.ts)
    const auto = taskStatuses[next].autoProgress;
    if (auto !== null) setProgress(auto);
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await onSave({ status, progress });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes");
      setSaving(false);
    }
  }
  async function handleDelete() {
    if (!onDelete) return;
    setError(null);
    setDeleting(true);
    try {
      await onDelete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete the task");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-semibold leading-snug">{task.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {task.team && <TeamBadge team={task.team} />}
          <PriorityBadge priority={task.priority} />
          {overdue && <Badge variant="danger">Overdue</Badge>}
        </div>
      </div>

      {task.description && (
        <p className="whitespace-pre-wrap text-sm text-muted">{task.description}</p>
      )}

      <div className="flex flex-col gap-2 text-sm text-muted">
        <span className="inline-flex items-center gap-2">
          <User size={16} />
          {task.assignee ? task.assignee.full_name || "Unnamed" : "Unassigned"}
        </span>
        <span className="inline-flex items-center gap-2">
          <CalendarDays size={16} />
          Due {formatDueDate(task.due_date)}
        </span>
      </div>

      {canEdit ? (
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
          />
          <div className="flex flex-col gap-2">
            <TaskProgress value={progress} onChange={setProgress} />
            <p className="text-xs text-muted">
              Moves automatically with the status. Drag it to fine-tune.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Status</span>
            <StatusBadge status={task.status} />
          </div>
          <ProgressBar value={task.progress} />
          <p className="text-xs text-muted">
            Only the assignee, the creator or a manager can change this task.
          </p>
        </div>
      )}

            {error && <p className="text-sm text-red-600">{error}</p>}

      {confirmingDelete && (
        <div className="flex flex-col gap-3 rounded-lg border border-red-300 p-4">
          <p className="text-sm">
            Delete this task permanently? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
            >
              Keep task
            </Button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div>
          {canDelete && onDelete && !confirmingDelete && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Delete task
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            {canEdit ? "Cancel" : "Close"}
          </Button>
          {canEdit && (
            <Button onClick={handleSave} loading={saving} disabled={!changed}>
              Save changes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}