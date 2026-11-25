import type { UserRole } from "@/types/user.types";

export interface Department {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  color: string; // "#RRGGBB"
  department_id: string | null;
  // true: members see all of the team's tasks. false: only their own.
  members_see_team_tasks: boolean;
  created_at: string;
}

export interface TeamMembership {
  team_id: string;
  is_lead: boolean;
}

// A person, with the teams they belong to
export interface Member {
  id: string;
  full_name: string;
  email: string | null;
  role: UserRole;
  department_id: string | null;
  job_title: string | null;
  is_active: boolean;
  memberships: TeamMembership[];
}

export interface TeamFormData {
  name: string;
  color: string;
  department_id: string;
  members_see_team_tasks: boolean;
}

export interface MemberProfileFormData {
  full_name: string;
  role: UserRole;
  department_id: string;
  job_title: string;
  is_active: boolean;
}
