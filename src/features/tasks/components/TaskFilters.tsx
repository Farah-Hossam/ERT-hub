"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { taskPriorities, taskStatuses } from "@/config/task-status";
import type { Team } from "@/features/team/types/team.types";
import type { TaskFilterState } from "../hooks/useTaskFilters";
import type { TaskPriority, TaskStatus } from "../types/task.types";

const statusOptions = [
  { value: "all", label: "All statuses" },
  ...Object.entries(taskStatuses).map(([value, { label }]) => ({ value, label })),
];

const priorityOptions = [
  { value: "all", label: "All priorities" },
  ...Object.entries(taskPriorities).map(([value, { label }]) => ({ value, label })),
];

interface TaskFiltersProps {
  filters: TaskFilterState;
  setFilter: <K extends keyof TaskFilterState>(
    key: K,
    value: TaskFilterState[K]
  ) => void;
  reset: () => void;
  isFiltering: boolean;
  assignees: { id: string; name: string }[];
  teams: Team[];
}

export function TaskFilters({
  filters,
  setFilter,
  reset,
  isFiltering,
  assignees,
  teams,
}: TaskFiltersProps) {
  const teamOptions = [
    { value: "all", label: "All teams" },
    { value: "none", label: "No team" },
    ...teams.map((t) => ({ value: t.id, label: t.name })),
  ];

  const assigneeOptions = [
    { value: "all", label: "Everyone" },
    { value: "unassigned", label: "Unassigned" },
    ...assignees.map((a) => ({ value: a.id, label: a.name })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder="Search by title or ID (for example ERT-003)"
        icon={<Search size={16} />}
        value={filters.search}
        onChange={(e) => setFilter("search", e.target.value)}
        aria-label="Search tasks"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          aria-label="Filter by status"
          options={statusOptions}
          value={filters.status}
          onChange={(e) => setFilter("status", e.target.value as TaskStatus | "all")}
        />
        <Select
          aria-label="Filter by priority"
          options={priorityOptions}
          value={filters.priority}
          onChange={(e) =>
            setFilter("priority", e.target.value as TaskPriority | "all")
          }
        />
        <Select
          aria-label="Filter by team"
          options={teamOptions}
          value={filters.team}
          onChange={(e) => setFilter("team", e.target.value)}
        />
        <Select
          aria-label="Filter by assignee"
          options={assigneeOptions}
          value={filters.assignee}
          onChange={(e) => setFilter("assignee", e.target.value)}
        />
        <label className="flex h-10 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.overdueOnly}
            onChange={(e) => setFilter("overdueOnly", e.target.checked)}
            className="accent-brand"
          />
          Overdue only
        </label>
      </div>

      {isFiltering && (
        <div>
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
