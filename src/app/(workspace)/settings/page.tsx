"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TeamBadge } from "@/components/shared/TeamBadge";
import { roleLabels } from "@/config/roles";
import { useTeams } from "@/features/team/hooks/useTeams";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

export default function SettingsPage() {
  const { profile, memberships, loading } = useCurrentUser();
  const { teams } = useTeams();

  const myTeams = memberships.flatMap((m) => {
    const team = teams.find((t) => t.id === m.team_id);
    return team ? [{ team, lead: m.is_lead }] : [];
  });

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted">Your account.</p>
      </div>

      <Card>
        <h2 className="font-semibold">Account</h2>
        {loading || !profile ? (
          <p className="mt-3 text-sm text-muted">Loading...</p>
        ) : (
          <dl className="mt-1 divide-y divide-border">
            <Row label="Name">{profile.full_name || "Not set"}</Row>
            <Row label="Email">{profile.email ?? "Not set"}</Row>
            <Row label="Position">{profile.job_title || "Not set"}</Row>
            <Row label="Role">
              <Badge variant="brand">{roleLabels[profile.role]}</Badge>
            </Row>
            <Row label="Teams">
              {myTeams.length === 0 ? (
                <span className="text-muted">No team yet</span>
              ) : (
                <span className="flex flex-wrap gap-1.5">
                  {myTeams.map(({ team, lead }) => (
                    <TeamBadge key={team.id} team={team} lead={lead} />
                  ))}
                </span>
              )}
            </Row>
          </dl>
        )}
        <p className="mt-3 text-xs text-muted">
          To change your name, position, role or teams, ask an admin or operations.
        </p>
      </Card>

      <Card>
        <h2 className="font-semibold">Security</h2>
        <p className="mt-1 text-sm text-muted">
          Choose a new password for your account.
        </p>
        <Link
          href="/change-password"
          className="mt-4 inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-semibold transition-colors hover:bg-surface-secondary"
        >
          Change password
        </Link>
      </Card>
    </div>
  );
}
