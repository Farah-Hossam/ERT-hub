"use client";

import { useMemo } from "react";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  getMyTasks,
  getNeedsAttention,
  getStats,
  getUpcomingDeadlines,
  type DashboardScope,
} from "../utils";

// Roles that see team-wide numbers instead of personal ones
const TEAM_ROLES = ["department_head", "operations", "leadership", "admin"];

export function useDashboardData() {
  const { tasks, loading: tasksLoading, error } = useTasks();
  const { profile, loading: profileLoading } = useCurrentUser();

  const scope: DashboardScope =
    profile && TEAM_ROLES.includes(profile.role) ? "team" : "mine";

  const data = useMemo(() => {
    if (!profile) {
      return { stats: [], myTasks: [], upcoming: [], attention: [] };
    }
    return {
      stats: getStats(tasks, profile.id, scope),
      myTasks: getMyTasks(tasks, profile.id),
      upcoming: getUpcomingDeadlines(tasks),
      attention: getNeedsAttention(tasks),
    };
  }, [tasks, profile, scope]);

  return {
    profile,
    scope,
    loading: tasksLoading || profileLoading,
    error,
    ...data,
  };
}
