"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createTeam,
  deleteTeam,
  getDepartments,
  getMembers,
  getTeams,
  removeMembership,
  setMembership,
  updateMemberProfile,
  updateTeam,
} from "../services/teamService";
import type {
  Department,
  Member,
  MemberProfileFormData,
  Team,
  TeamFormData,
} from "../types/team.types";

// Everything the Team page needs, plus the actions that change it
export function useTeamData() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [t, d, m] = await Promise.all([getTeams(), getDepartments(), getMembers()]);
      setTeams(t);
      setDepartments(d);
      setMembers(m);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the team");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const addTeam = useCallback(
    async (input: TeamFormData) => {
      await createTeam(input);
      await refresh();
    },
    [refresh]
  );

  const editTeam = useCallback(
    async (id: string, input: TeamFormData) => {
      await updateTeam(id, input);
      await refresh();
    },
    [refresh]
  );

  const removeTeam = useCallback(
    async (id: string) => {
      await deleteTeam(id);
      await refresh();
    },
    [refresh]
  );

  const assign = useCallback(
    async (teamId: string, profileId: string, isLead: boolean) => {
      await setMembership(teamId, profileId, isLead);
      await refresh();
    },
    [refresh]
  );

  const unassign = useCallback(
    async (teamId: string, profileId: string) => {
      await removeMembership(teamId, profileId);
      await refresh();
    },
    [refresh]
  );

  const saveMember = useCallback(
    async (id: string, input: MemberProfileFormData) => {
      await updateMemberProfile(id, input);
      await refresh();
    },
    [refresh]
  );

  return {
    teams,
    departments,
    members,
    loading,
    error,
    addTeam,
    editTeam,
    removeTeam,
    assign,
    unassign,
    saveMember,
  };
}
