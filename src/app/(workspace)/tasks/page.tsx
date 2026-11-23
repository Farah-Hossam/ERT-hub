"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { TaskCard } from "@/features/tasks/components/TaskCard";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import { useTaskMembers } from "@/features/tasks/hooks/useTaskMembers";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Matches the database rule: only these roles can create tasks
const CAN_CREATE_ROLES = ["department_head", "operations", "admin"];

export default function TasksPage() {
  const { tasks, loading, error, addTask } = useTasks();
  const { profile } = useCurrentUser();
  const [modalOpen, setModalOpen] = useState(false);

  const canCreate = !!profile && CAN_CREATE_ROLES.includes(profile.role);
  const members = useTaskMembers(canCreate);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted">
            {loading ? "Loading..." : `${tasks.length} tasks`}
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            New task
          </Button>
        )}
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600">Could not load tasks: {error}</p>
        </Card>
      )}

      {!loading && !error && tasks.length === 0 && (
        <Card>
          <p className="text-sm text-muted">No tasks yet.</p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New task"
        closeOnBackdrop={false}
      >
        <TaskForm
          members={members}
          onCancel={() => setModalOpen(false)}
          onSubmit={async (data) => {
            await addTask(data);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
