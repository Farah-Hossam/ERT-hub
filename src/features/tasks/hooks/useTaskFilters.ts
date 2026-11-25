"use client";

import { useMemo, useState } from "react";
import type { Task, TaskPriority, TaskStatus } from "../types/task.types";
import { formatTaskId, isOverdue } from "../utils";

export interface TaskFilterState {
  search: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  assignee: string; // "all", "unassigned", or a person's id
  team: string; // "all", "none", or a team's id
  overdueOnly: boolean;
}

export const defaultFilters: TaskFilterState = {
  search: "",
  status: "all",
  priority: "all",
  assignee: "all",
  team: "all",
  overdueOnly: false,
};

export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<TaskFilterState>(defaultFilters);

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return tasks.filter((task) => {
      if (query) {
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesId = formatTaskId(task.task_number).toLowerCase().includes(query);
        if (!matchesTitle && !matchesId) return false;
      }
      if (filters.status !== "all" && task.status !== filters.status) return false;
      if (filters.priority !== "all" && task.priority !== filters.priority) return false;
      if (filters.assignee === "unassigned" && task.assignee_id !== null) return false;
      if (
        filters.assignee !== "all" &&
        filters.assignee !== "unassigned" &&
        task.assignee_id !== filters.assignee
      ) {
        return false;
      }
      if (filters.team === "none" && task.team_id !== null) return false;
      if (filters.team !== "all" && filters.team !== "none" && task.team_id !== filters.team) {
        return false;
      }
      if (filters.overdueOnly && !isOverdue(task)) return false;
      return true;
    });
  }, [tasks, filters]);

  const isFiltering =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.assignee !== "all" ||
    filters.team !== "all" ||
    filters.overdueOnly;

  function setFilter<K extends keyof TaskFilterState>(
    key: K,
    value: TaskFilterState[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setFilters(defaultFilters);
  }

  return { filters, setFilter, reset, filtered, isFiltering };
}
