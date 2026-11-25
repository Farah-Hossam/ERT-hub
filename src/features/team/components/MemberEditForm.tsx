"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { roleLabels } from "@/config/roles";
import type { UserRole } from "@/types/user.types";
import type {
  Department,
  Member,
  MemberProfileFormData,
  Team,
} from "../types/team.types";

const roleOptions = (Object.keys(roleLabels) as UserRole[]).map((value) => ({
  value,
  label: roleLabels[value],
}));

interface MemberEditFormProps {
  member: Member;
  teams: Team[];
  departments: Department[];
  canEditProfile: boolean; // name, department, title, active
  canEditRole: boolean; // admins only
  assignableTeamIds: Set<string>; // teams the viewer may add or remove people from
  onSaveProfile: (data: MemberProfileFormData) => Promise<void>;
  onSetMembership: (teamId: string, isLead: boolean) => Promise<void>;
  onRemoveMembership: (teamId: string) => Promise<void>;
  onClose: () => void;
}

export function MemberEditForm({
  member,
  teams,
  departments,
  canEditProfile,
  canEditRole,
  assignableTeamIds,
  onSaveProfile,
  onSetMembership,
  onRemoveMembership,
  onClose,
}: MemberEditFormProps) {
  const [form, setForm] = useState<MemberProfileFormData>({
    full_name: member.full_name,
    role: member.role,
    department_id: member.department_id ?? "",
    job_title: member.job_title ?? "",
    is_active: member.is_active,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [busyTeam, setBusyTeam] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSaveProfile() {
    setError(null);
    setSaved(false);
    setSavingProfile(true);
    try {
      await onSaveProfile(form);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changeMembership(teamId: string, action: () => Promise<void>) {
    setError(null);
    setBusyTeam(teamId);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change the team");
    } finally {
      setBusyTeam(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {canEditProfile && (
        <section className="flex flex-col gap-4">
          <h3 className="font-semibold">Profile</h3>
          <Input
            label="Name"
            value={form.full_name}
            onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Role"
              options={roleOptions}
              value={form.role}
              disabled={!canEditRole}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
            />
            <Select
              label="Department"
              placeholder="No department"
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
              value={form.department_id}
              onChange={(e) => setForm((p) => ({ ...p, department_id: e.target.value }))}
            />
          </div>
          {!canEditRole && (
            <p className="-mt-2 text-xs text-muted">Only admins can change roles.</p>
          )}
          <Input
            label="Position"
            placeholder="Head of Operations and Logistics"
            value={form.job_title}
            onChange={(e) => setForm((p) => ({ ...p, job_title: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
              className="accent-brand"
            />
            Active member
          </label>
          <div className="flex items-center justify-end gap-3">
            {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved</span>}
            <Button onClick={handleSaveProfile} loading={savingProfile}>
              Save profile
            </Button>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div>
          <h3 className="font-semibold">Teams</h3>
          <p className="text-xs text-muted">
            Changes here are saved straight away. A lead sees their whole team&apos;s tasks
            and can create tasks for it.
          </p>
        </div>

        {teams.length === 0 ? (
          <p className="text-sm text-muted">No teams yet. Create one on the Team page first.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {teams.map((team) => {
              const membership = member.memberships.find((m) => m.team_id === team.id);
              const allowed = assignableTeamIds.has(team.id);
              const busy = busyTeam === team.id;
              return (
                <li key={team.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <label className="flex min-w-0 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!membership}
                      disabled={!allowed || busy}
                      onChange={(e) =>
                        changeMembership(team.id, () =>
                          e.target.checked
                            ? onSetMembership(team.id, false)
                            : onRemoveMembership(team.id)
                        )
                      }
                      className="accent-brand"
                    />
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: team.color }}
                      aria-hidden
                    />
                    <span className="truncate">{team.name}</span>
                  </label>
                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={!!membership?.is_lead}
                      disabled={!membership || !allowed || busy}
                      onChange={(e) =>
                        changeMembership(team.id, () => onSetMembership(team.id, e.target.checked))
                      }
                      className="accent-brand"
                    />
                    Lead
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
