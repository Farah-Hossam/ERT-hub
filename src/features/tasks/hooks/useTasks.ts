"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTaskProgress,
} from "../services/taskService";
import type { Task, TaskFormData, TaskStatus } from "../types/task.types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setTasks(await getTasks());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const addTask = useCallback(
    async (input: TaskFormData) => {
      await createTask(input);
      await refresh();
    },
    [refresh]
  );

  const changeTask = useCallback(
    async (id: string, changes: { status: TaskStatus; progress: number }) => {
      await updateTaskProgress(id, changes);
      await refresh();
    },
    [refresh]
  );
  const removeTask = useCallback(
    async (id: string) => {
      await deleteTask(id);
      await refresh();
    },
    [refresh]
  );
  return { tasks, loading, error, refresh, addTask, changeTask, removeTask };
}
