"use client";

import { useCallback, useEffect, useState } from "react";
import { createTask, getTasks } from "../services/taskService";
import type { Task, TaskFormData } from "../types/task.types";

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
    refresh();
  }, [refresh]);

  const addTask = useCallback(
    async (input: TaskFormData) => {
      await createTask(input);
      await refresh();
    },
    [refresh]
  );

  return { tasks, loading, error, refresh, addTask };
}
