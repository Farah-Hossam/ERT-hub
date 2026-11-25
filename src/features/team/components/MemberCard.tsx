import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TeamBadge } from "@/components/shared/TeamBadge";
import { roleLabels } from "@/config/roles";
import { cn, getInitials } from "@/lib/utils";
import type { Member, Team } from "../types/team.types";

interface MemberCardProps {
  member: Member;
  teams: Team[];
  departmentName?: string;
  onOpen?: () => void;
}

export function MemberCard({ member, teams, departmentName, onOpen }: MemberCardProps) {
  const name = member.full_name || member.email || "Unnamed";
  const memberTeams = member.memberships.flatMap((m) => {
    const team = teams.find((t) => t.id === m.team_id);
    return team ? [{ team, lead: m.is_lead }] : [];
  });

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
      className={cn("flex flex-col gap-3", !member.is_active && "opacity-60")}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
          {getInitials(name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold leading-snug">{name}</p>
          <p className="truncate text-xs text-muted">
            {[member.job_title, departmentName].filter(Boolean).join(", ") || roleLabels[member.role]}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {member.role !== "member" && <Badge variant="brand">{roleLabels[member.role]}</Badge>}
        {!member.is_active && <Badge>Inactive</Badge>}
        {memberTeams.map(({ team, lead }) => (
          <TeamBadge key={team.id} team={team} lead={lead} />
        ))}
        {memberTeams.length === 0 && (
          <span className="text-xs text-muted">No team yet</span>
        )}
      </div>
    </Card>
  );
}
