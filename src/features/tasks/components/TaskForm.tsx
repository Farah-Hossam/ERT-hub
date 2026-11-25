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
  assignee_id: "",
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
    setForm((prev) => {
      const assigneeStillFits =
        !teamId ||
        !!members.find((m) => m.id === prev.assignee_id)?.team_ids.includes(teamId);
      return {
        ...prev,
        team_id: teamId,
        assignee_id: assigneeStillFits ? prev.assignee_id : "",
      };
    });
  }

  const shownMembers = form.team_id
    ? members.filter((m) => m.team_ids.includes(form.team_id))
    : members;

  const memberOptions = shownMembers.map((m) => ({
    value: m.id,
    label: m.full_name || m.email || "Unnamed",
  }));

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

      <Select
        label="Assignee"
        placeholder="Unassigned"
        options={memberOptions}
        value={form.assignee_id}
        onChange={(e) => update("assignee_id", e.target.value)}
      />

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
