"use client";

import { useEffect, useState } from "react";
import { getTeams } from "../services/teamService";
import type { Team } from "../types/team.types";

// Just the list of teams, for filters and forms
export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch(() => setTeams([]));
  }, []);

  return { teams };
}
