import type { Team, TeamMembership } from "@/features/team/types/team.types";
import type { Profile } from "@/types/user.types";

// These functions decide what the screens show. They mirror the rules in the
// database (see 006_teams.sql), which is what actually enforces them.

type Who = Pick<Profile, "role" | "department_id"> | null;

export function isAdminOrOperations(who: Who): boolean {
  return !!who && (who.role === "admin" || who.role === "operations");
}

// The top board sees every task: operations, leadership and admins
export function isTopBoard(who: Who): boolean {
  return !!who && ["operations", "leadership", "admin"].includes(who.role);
}

export function isLeadAnywhere(memberships: TeamMembership[]): boolean {
  return memberships.some((m) => m.is_lead);
}

// Teams this person can create tasks for:
// everything for admin and operations, a department's teams for its head,
// and the teams someone leads.
export function manageableTeams(
  who: Who,
  memberships: TeamMembership[],
  teams: Team[]
): Team[] {
  if (!who) return [];
  if (isAdminOrOperations(who)) return teams;
  const led = new Set(memberships.filter((m) => m.is_lead).map((m) => m.team_id));
  return teams.filter(
    (t) =>
      led.has(t.id) ||
      (who.role === "department_head" &&
        who.department_id !== null &&
        t.department_id === who.department_id)
  );
}

// Teams whose members this person can add or remove
export function assignableTeams(who: Who, teams: Team[]): Team[] {
  if (!who) return [];
  if (isAdminOrOperations(who)) return teams;
  if (who.role === "department_head" && who.department_id !== null) {
    return teams.filter((t) => t.department_id === who.department_id);
  }
  return [];
}

export function canCreateTasks(
  who: Who,
  memberships: TeamMembership[],
  teams: Team[]
): boolean {
  return (
    isAdminOrOperations(who) || manageableTeams(who, memberships, teams).length > 0
  );
}

export function canViewTeamReports(
  who: Who,
  memberships: TeamMembership[]
): boolean {
  return (
    !!who &&
    (["department_head", "operations", "leadership", "admin"].includes(who.role) ||
      isLeadAnywhere(memberships))
  );
}

// Leadership can read reports but not review them
export function canReviewReports(
  who: Who,
  memberships: TeamMembership[]
): boolean {
  return (
    !!who &&
    (["department_head", "operations", "admin"].includes(who.role) ||
      isLeadAnywhere(memberships))
  );
}
