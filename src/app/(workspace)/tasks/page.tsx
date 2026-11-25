"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useTeams } from "@/features/team/hooks/useTeams";
import { TaskBoard } from "@/features/tasks/components/TaskBoard";
import { TaskCard } from "@/features/tasks/components/TaskCard";
import { TaskDetails } from "@/features/tasks/components/TaskDetails";
import { TaskFilters } from "@/features/tasks/components/TaskFilters";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import {
  TaskViewToggle,
  type TaskView,
} from "@/features/tasks/components/TaskViewToggle";
import { useTaskFilters } from "@/features/tasks/hooks/useTaskFilters";
import { useTaskMembers } from "@/features/tasks/hooks/useTaskMembers";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { formatTaskId } from "@/features/tasks/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  canCreateTasks,
  isAdminOrOperations,
  manageableTeams,
} from "@/lib/access";

export default function TasksPage() {
  const { tasks, loading, error, addTask, changeTask, removeTask } = useTasks();  const { profile, memberships } = useCurrentUser();
  const { teams } = useTeams();
  const { filters, setFilter, reset, filtered, isFiltering } = useTaskFilters(tasks);
  const [view, setView] = useState<TaskView>("cards");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Teams you can create tasks for. The database makes the same decision.
  const creatableTeams = useMemo(
    () => manageableTeams(profile, memberships, teams),
    [profile, memberships, teams]
  );
  const canCreate = canCreateTasks(profile, memberships, teams);
  const members = useTaskMembers(canCreate);

  // People who appear as assignees, for the assignee filter
  const assignees = useMemo(() => {
    const byId = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.assignee) byId.set(t.assignee.id, t.assignee.full_name || "Unnamed");
    });
    return [...byId]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  // Look the task up in the list so it always shows the latest saved values
  const selected = tasks.find((t) => t.id === selectedId) ?? null;
  const canEditSelected =
    !!profile &&
    !!selected &&
    (isAdminOrOperations(profile) ||
      selected.assignee_id === profile.id ||
      selected.created_by === profile.id ||
      (selected.team_id !== null &&
        creatableTeams.some((t) => t.id === selected.team_id)));

  const countText = loading
    ? "Loading..."
    : isFiltering
      ? `${filtered.length} of ${tasks.length} tasks`
      : `${tasks.length} tasks`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted">{countText}</p>
        </div>
        <div className="flex items-center gap-3">
          <TaskViewToggle value={view} onChange={setView} />
          {canCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              New task
            </Button>
          )}
        </div>
      </div>

      <TaskFilters
        filters={filters}
        setFilter={setFilter}
        reset={reset}
        isFiltering={isFiltering}
        assignees={assignees}
        teams={teams}
      />

      {error && (
        <Card>
          <p className="text-sm text-red-600">Could not load tasks: {error}</p>
        </Card>
      )}

      {!loading && !error && tasks.length === 0 && (
        <Card>
          <p className="text-sm text-muted">No tasks to show.</p>
        </Card>
      )}

      {!loading && tasks.length > 0 && filtered.length === 0 && (
        <Card className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted">No tasks match your filters.</p>
          <Button variant="outline" size="sm" onClick={reset}>
            Clear filters
          </Button>
        </Card>
      )}

      {view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={() => setSelectedId(task.id)}
            />
          ))}
        </div>
      ) : (
        tasks.length > 0 && <TaskBoard tasks={filtered} onOpen={setSelectedId} />
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New task"
        closeOnBackdrop={false}
      >
        <TaskForm
          members={members}
          teams={creatableTeams}
          teamRequired={!isAdminOrOperations(profile)}
          onCancel={() => setCreateOpen(false)}
          onSubmit={async (data) => {
            await addTask(data);
            setCreateOpen(false);
          }}
        />
      </Modal>

      <Modal
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected ? formatTaskId(selected.task_number) : "Task"}
      >
        {selected && (
          <TaskDetails
            key={selected.id}
            task={selected}
            canEdit={canEditSelected}
            canDelete={isAdminOrOperations(profile)}
            onDelete={async () => {
              await removeTask(selected.id);
              setSelectedId(null);
            }}
            onClose={() => setSelectedId(null)}
            onSave={async (changes) => {
              await changeTask(selected.id, changes);
              setSelectedId(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
