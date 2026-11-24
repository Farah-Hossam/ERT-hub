import { taskStatuses, type BadgeVariant } from "@/config/task-status";
import type { Task, TaskStatus } from "../types/task.types";
import { TaskCard } from "./TaskCard";

const dotStyles: Record<BadgeVariant, string> = {
  neutral: "bg-muted",
  brand: "bg-brand",
  success: "bg-green-600",
  warning: "bg-amber-500",
  danger: "bg-red-600",
  info: "bg-blue-500",
};

const columns = Object.keys(taskStatuses) as TaskStatus[];

interface TaskBoardProps {
  tasks: Task[];
  onOpen: (taskId: string) => void;
}

// Kanban-style board: one column per status
export function TaskBoard({ tasks, onOpen }: TaskBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((status) => {
        const { label, variant } = taskStatuses[status];
        const columnTasks = tasks.filter((t) => t.status === status);

        return (
          <section
            key={status}
            aria-label={label}
            className="flex w-72 shrink-0 flex-col gap-3 rounded-xl bg-surface-secondary/60 p-3"
          >
            <header className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${dotStyles[variant]}`} />
                <h2 className="text-sm font-semibold">{label}</h2>
              </div>
              <span className="text-xs text-muted">{columnTasks.length}</span>
            </header>

            {columnTasks.length === 0 ? (
              <p className="px-1 py-4 text-center text-xs text-muted">No tasks</p>
            ) : (
              columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} onOpen={() => onOpen(task.id)} />
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}
