"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DEFAULT_TEAM_COLOR } from "@/config/team-colors";
import type { Department, Team, TeamFormData } from "../types/team.types";
import { ColorPicker } from "./ColorPicker";

interface TeamFormProps {
  team: Team | null; // the team being edited, or null for a new one
  departments: Department[];
  onSubmit: (data: TeamFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

export function TeamForm({ team, departments, onSubmit, onDelete, onCancel }: TeamFormProps) {
  const [form, setForm] = useState<TeamFormData>({
    name: team?.name ?? "",
    color: team?.color ?? DEFAULT_TEAM_COLOR,
    department_id: team?.department_id ?? "",
    members_see_team_tasks: team?.members_see_team_tasks ?? true,
  });
  const [nameError, setNameError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setNameError("Give the team a name");
      return;
    }
    setNameError(undefined);

    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the team");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setError(null);
    setDeleting(true);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the team");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Team name"
        placeholder="Mechanical"
        required
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        error={nameError}
      />

      <Select
        label="Department"
        placeholder="No department"
        options={departments.map((d) => ({ value: d.id, label: d.name }))}
        value={form.department_id}
        onChange={(e) => setForm((p) => ({ ...p, department_id: e.target.value }))}
      />

      <ColorPicker
        value={form.color}
        onChange={(hex) => setForm((p) => ({ ...p, color: hex }))}
      />

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.members_see_team_tasks}
          onChange={(e) =>
            setForm((p) => ({ ...p, members_see_team_tasks: e.target.checked }))
          }
          className="mt-0.5 accent-brand"
        />
        <span>
          Members can see all of this team&apos;s tasks
          <span className="block text-xs text-muted">
            Turn this off and members see only the tasks assigned to them. Leads and
            managers always see the whole team.
          </span>
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between gap-2 pt-2">
        {onDelete ? (
          confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Delete this team?</span>
              <Button variant="destructive" size="sm" loading={deleting} onClick={handleDelete}>
                Yes, delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                No
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)}>
              Delete team
            </Button>
          )
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {team ? "Save team" : "Create team"}
          </Button>
        </div>
      </div>
    </form>
  );
}
