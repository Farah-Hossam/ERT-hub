import { Card } from "@/components/ui/Card";
import type { Member, Team } from "../types/team.types";

interface TeamCardProps {
  team: Team;
  members: Member[];
  departmentName?: string;
  onOpen?: () => void;
}

export function TeamCard({ team, members, departmentName, onOpen }: TeamCardProps) {
  const teamMembers = members.filter((m) =>
    m.memberships.some((x) => x.team_id === team.id)
  );
  const leads = teamMembers.filter((m) =>
    m.memberships.some((x) => x.team_id === team.id && x.is_lead)
  );

  return (
    <Card
      interactive={!!onOpen}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (onOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen();
        }
      }}
      className="flex flex-col gap-2"
      style={{ borderLeftColor: team.color, borderLeftWidth: 4 }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug">{team.name}</h3>
        <span className="shrink-0 text-xs text-muted">
          {teamMembers.length} {teamMembers.length === 1 ? "member" : "members"}
        </span>
      </div>
      <p className="text-xs text-muted">{departmentName ?? "No department"}</p>
      <p className="text-xs text-muted">
        Lead:{" "}
        {leads.length > 0
          ? leads.map((l) => l.full_name || l.email || "Unnamed").join(", ")
          : "none yet"}
      </p>
      <p className="text-xs text-muted">
        Members see {team.members_see_team_tasks ? "all of the team's tasks" : "only their own tasks"}
      </p>
    </Card>
  );
}
