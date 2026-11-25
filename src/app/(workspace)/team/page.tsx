"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { MemberCard } from "@/features/team/components/MemberCard";
import { MemberEditForm } from "@/features/team/components/MemberEditForm";
import { TeamCard } from "@/features/team/components/TeamCard";
import { TeamForm } from "@/features/team/components/TeamForm";
import { useTeamData } from "@/features/team/hooks/useTeamData";
import type { Team } from "@/features/team/types/team.types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { assignableTeams, isAdminOrOperations } from "@/lib/access";

export default function TeamPage() {
  const { profile } = useCurrentUser();
  const data = useTeamData();
  const { teams, departments, members, loading, error } = data;

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [teamModal, setTeamModal] = useState<{ team: Team | null } | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  const canManageTeams = isAdminOrOperations(profile);
  const canEditProfiles = canManageTeams;
  const canEditRoles = profile?.role === "admin";
  const assignableIds = useMemo(
    () => new Set(assignableTeams(profile, teams).map((t) => t.id)),
    [profile, teams]
  );
  const canEditMembers = canEditProfiles || assignableIds.size > 0;

  const departmentName = (id: string | null) =>
    departments.find((d) => d.id === id)?.name;

  const visibleMembers = members.filter((m) => {
    const q = search.trim().toLowerCase();
    if (q && !`${m.full_name} ${m.email ?? ""} ${m.job_title ?? ""}`.toLowerCase().includes(q)) {
      return false;
    }
    if (teamFilter === "none") return m.memberships.length === 0;
    if (teamFilter !== "all") return m.memberships.some((x) => x.team_id === teamFilter);
    return true;
  });

  const selectedMember = members.find((m) => m.id === memberId) ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm text-muted">
          {loading ? "Loading..." : `${members.length} people in ${teams.length} teams`}
        </p>
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600">Could not load the team: {error}</p>
        </Card>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Teams</h2>
          {canManageTeams && (
            <Button size="sm" onClick={() => setTeamModal({ team: null })}>
              <Plus size={14} />
              New team
            </Button>
          )}
        </div>

        {!loading && teams.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">
              No teams yet.
              {canManageTeams && " Create the first one to start organizing tasks by team."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                members={members}
                departmentName={departmentName(team.department_id)}
                onOpen={canManageTeams ? () => setTeamModal({ team }) : undefined}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Members</h2>

        <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
          <Input
            placeholder="Search by name, email or position"
            icon={<Search size={16} />}
            aria-label="Search members"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            aria-label="Filter by team"
            options={[
              { value: "all", label: "All teams" },
              { value: "none", label: "No team yet" },
              ...teams.map((t) => ({ value: t.id, label: t.name })),
            ]}
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          />
        </div>

        {!loading && visibleMembers.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No one matches.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                teams={teams}
                departmentName={departmentName(member.department_id)}
                onOpen={canEditMembers ? () => setMemberId(member.id) : undefined}
              />
            ))}
          </div>
        )}
      </section>

      <Modal
        open={teamModal !== null}
        onClose={() => setTeamModal(null)}
        title={teamModal?.team ? "Edit team" : "New team"}
        closeOnBackdrop={false}
      >
        {teamModal && (
          <TeamForm
            key={teamModal.team?.id ?? "new"}
            team={teamModal.team}
            departments={departments}
            onCancel={() => setTeamModal(null)}
            onSubmit={async (form) => {
              if (teamModal.team) await data.editTeam(teamModal.team.id, form);
              else await data.addTeam(form);
              setTeamModal(null);
            }}
            onDelete={
              teamModal.team
                ? async () => {
                    await data.removeTeam(teamModal.team!.id);
                    setTeamModal(null);
                  }
                : undefined
            }
          />
        )}
      </Modal>

      <Modal
        open={!!selectedMember}
        onClose={() => setMemberId(null)}
        title={selectedMember ? selectedMember.full_name || selectedMember.email || "Member" : "Member"}
        size="lg"
      >
        {selectedMember && (
          <MemberEditForm
            key={selectedMember.id}
            member={selectedMember}
            teams={teams}
            departments={departments}
            canEditProfile={canEditProfiles}
            canEditRole={canEditRoles}
            assignableTeamIds={assignableIds}
            onSaveProfile={(form) => data.saveMember(selectedMember.id, form)}
            onSetMembership={(teamId, isLead) => data.assign(teamId, selectedMember.id, isLead)}
            onRemoveMembership={(teamId) => data.unassign(teamId, selectedMember.id)}
            onClose={() => setMemberId(null)}
          />
        )}
      </Modal>
    </div>
  );
}
