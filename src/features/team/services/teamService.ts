import { createClient } from "@/lib/supabase/client";
import type {
  Department,
  Member,
  MemberProfileFormData,
  Team,
  TeamFormData,
} from "../types/team.types";

export async function getTeams(): Promise<Team[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("teams").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Team[];
}

export async function getDepartments(): Promise<Department[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id, name")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Department[];
}

export async function getMembers(): Promise<Member[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, role, department_id, job_title, is_active, memberships:team_memberships(team_id, is_lead)"
    )
    .order("full_name");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Member[];
}

export async function createTeam(input: TeamFormData): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("teams").insert({
    name: input.name.trim(),
    color: input.color,
    department_id: input.department_id || null,
    members_see_team_tasks: input.members_see_team_tasks,
  });
  if (error) {
    if (error.code === "23505") throw new Error("A team with this name already exists");
    throw new Error(error.message);
  }
}

export async function updateTeam(id: string, input: TeamFormData): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("teams")
    .update({
      name: input.name.trim(),
      color: input.color,
      department_id: input.department_id || null,
      members_see_team_tasks: input.members_see_team_tasks,
    })
    .eq("id", id)
    .select("id");
  if (error) {
    if (error.code === "23505") throw new Error("A team with this name already exists");
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    throw new Error("You don't have permission to edit this team");
  }
}

export async function deleteTeam(id: string): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("teams")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("You don't have permission to delete this team");
  }
}

export async function setMembership(
  teamId: string,
  profileId: string,
  isLead: boolean
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("team_memberships")
    .upsert(
      { team_id: teamId, profile_id: profileId, is_lead: isLead },
      { onConflict: "team_id,profile_id" }
    );
  if (error) throw new Error(error.message);
}

export async function removeMembership(
  teamId: string,
  profileId: string
): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("team_memberships")
    .delete()
    .eq("team_id", teamId)
    .eq("profile_id", profileId)
    .select("team_id");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("You don't have permission to change this team");
  }
}

// Role and department can only be changed through this database function,
// which checks who is asking.
export async function updateMemberProfile(
  id: string,
  input: MemberProfileFormData
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("admin_update_profile", {
    p_id: id,
    p_full_name: input.full_name,
    p_role: input.role,
    p_department_id: input.department_id || null,
    p_job_title: input.job_title,
    p_is_active: input.is_active,
  });
  if (error) throw new Error(error.message);
}
