"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { taskPriorities } from "@/config/task-status";
import type { Team } from "@/features/team/types/team.types";
import {
  validateTaskForm,
  type TaskFormErrors,
} from "@/lib/validators/task.validator";
import type { TaskFormData, TaskMember } from "../types/task.types";

const emptyForm: TaskFormData = {
  title: "",
  description: "",
  priority: "medium",
  assignee_ids: [],
  team_id: "",
  start_date: "",
  due_date: "",
};

const priorityOptions = Object.entries(taskPriorities).map(
  ([value, { label }]) => ({ value, label })
);

interface TaskFormProps {
  members: TaskMember[];
  teams: Team[]; // the teams this person can create tasks for
  teamRequired: boolean;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({
  members,
  teams,
  teamRequired,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [form, setForm] = useState<TaskFormData>(emptyForm);
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const found = validateTaskForm(form, teamRequired);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not save the task"
      );
      setSaving(false);
    }
  }

  // Picking a team narrows the assignee list to that team's members
  function handleTeamChange(teamId: string) {
    setForm((prev) => ({
      ...prev,
      team_id: teamId,
      assignee_ids: teamId
        ? prev.assignee_ids.filter((id) =>
            members.find((m) => m.id === id)?.team_ids.includes(teamId)
          )
        : prev.assignee_ids,
    }));
  }

  function toggleAssignee(id: string) {
    setForm((prev) => ({
      ...prev,
      assignee_ids: prev.assignee_ids.includes(id)
        ? prev.assignee_ids.filter((x) => x !== id)
        : [...prev.assignee_ids, id],
    }));
  }

  const shownMembers = form.team_id
    ? members.filter((m) => m.team_ids.includes(form.team_id))
    : members;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Title"
        placeholder="Design the steering column"
        required
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
        error={errors.title}
      />

      <Textarea
        label="Description"
        placeholder="What needs to be done?"
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Team"
          required={teamRequired}
          placeholder={teamRequired ? "Choose a team" : "No team"}
          options={teams.map((t) => ({ value: t.id, label: t.name }))}
          value={form.team_id}
          onChange={(e) => handleTeamChange(e.target.value)}
          error={errors.team_id}
        />
        <Select
          label="Priority"
          options={priorityOptions}
          value={form.priority}
          onChange={(e) =>
            update("priority", e.target.value as TaskFormData["priority"])
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Assignees
          {form.assignee_ids.length > 0 ? ` (${form.assignee_ids.length})` : ""}
        </span>
        <div className="max-h-44 overflow-y-auto rounded-lg border border-border p-2">
          {shownMembers.length === 0 ? (
            <p className="p-2 text-sm text-muted">No members to choose from.</p>
          ) : (
            shownMembers.map((m) => (
              <label
                key={m.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-black/5"
              >
                <input
                  type="checkbox"
                  checked={form.assignee_ids.includes(m.id)}
                  onChange={() => toggleAssignee(m.id)}
                  className="accent-brand"
                />
                {m.full_name || m.email || "Unnamed"}
              </label>
            ))
          )}
        </div>
        <p className="text-xs text-muted">Tick one or more. Leave empty for unassigned.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Start date"
          type="date"
          value={form.start_date}
          onChange={(e) => update("start_date", e.target.value)}
        />
        <Input
          label="Due date"
          type="date"
          value={form.due_date}
          onChange={(e) => update("due_date", e.target.value)}
          error={errors.due_date}
        />
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Create task
        </Button>
      </div>
    </form>
  );
}