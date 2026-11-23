"use client";

import { useEffect, useState } from "react";
import { getAssignableMembers } from "../services/taskService";
import type { TaskMember } from "../types/task.types";

export function useTaskMembers(enabled: boolean) {
  const [members, setMembers] = useState<TaskMember[]>([]);

  useEffect(() => {
    if (!enabled) return;
    getAssignableMembers()
      .then(setMembers)
      .catch(() => setMembers([]));
  }, [enabled]);

  return members;
}
